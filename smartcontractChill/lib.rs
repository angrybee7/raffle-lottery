use anchor_lang::prelude::*;

declare_id!("7hZNCZkQsruSu3VmjD3WN7ev1JBPLr44mVeNUxqe1mZK");

#[program]
pub mod solana_lottery {
    use super::*;

    pub fn update_bypass(
        ctx: Context<UpdateBypass>, 
        bypass_value: bool
    ) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        lottery.bypass = bypass_value;
        Ok(())
    }

    pub fn create_lottery(
        ctx: Context<CreateLottery>,
        ticket_price: u64,
        winner_percentage: u8,
        threshold: u64,
        treasury: Pubkey,
    ) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        require!(winner_percentage > 0 && winner_percentage <= 100, ErrorCode::InvalidWinnerPercentage);

        lottery.authority = *ctx.accounts.authority.key;
        lottery.ticket_price = ticket_price;
        lottery.winner_percentage = winner_percentage;
        lottery.threshold = threshold;
        lottery.treasury = treasury;
        lottery.randomness_requested = false;
        lottery.prize_pool = 0;
        lottery.ticket_buyers = vec![];
        lottery.bypass = false;

        emit!(LotteryCreated {
            lottery: lottery.key(),
            authority: lottery.authority,
            ticket_price,
            winner_percentage,
            threshold,
            treasury,
        });

        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, num_tickets: u64) -> Result<()> {
        let total_cost = ctx.accounts.lottery.ticket_price
            .checked_mul(num_tickets)
            .ok_or(ErrorCode::NumericalOverflow)?;

        // Transfer to lottery account
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.buyer.key,
            ctx.accounts.lottery.to_account_info().key,
            total_cost,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.lottery.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update lottery state
        let lottery = &mut ctx.accounts.lottery;
        lottery.prize_pool = lottery.prize_pool.checked_add(total_cost).ok_or(ErrorCode::NumericalOverflow)?;

        for _ in 0..num_tickets {
            lottery.ticket_buyers.push(*ctx.accounts.buyer.key);
        }

        emit!(TicketsPurchased {
            lottery: lottery.key(),
            buyer: *ctx.accounts.buyer.key,
            num_tickets,
            total_cost,
        });

        Ok(())
    }

    pub fn request_randomness(ctx: Context<RequestRandomness>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        
        require!(
            lottery.prize_pool >= lottery.threshold || lottery.bypass, 
            ErrorCode::ThresholdNotMet
        );

        lottery.randomness_requested = true;

        emit!(RandomnessRequested {
            lottery: lottery.key(),
        });

        Ok(())
    }

    pub fn process_randomness(ctx: Context<ProcessRandomness>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        require!(lottery.randomness_requested, ErrorCode::RandomnessNotRequested);
        require!(!lottery.ticket_buyers.is_empty(), ErrorCode::NoTicketsSold);

        let clock = Clock::get()?;
        let mut result_buffer = [0u8; 32];
        result_buffer[..8].copy_from_slice(&clock.unix_timestamp.to_le_bytes());

        let winner_index = calculate_winner_index(&result_buffer, lottery.ticket_buyers.len());
        let winner_pubkey = lottery.ticket_buyers[winner_index];
      
        lottery.winner = winner_pubkey;

        emit!(RandomnessProcessed {
            lottery: lottery.key(),
            winner: winner_pubkey,
        });

        Ok(())
    }

    pub fn send_prize (ctx: Context<SendPrize>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let total_prize_pool = lottery.prize_pool;
        let winner_share = total_prize_pool * (lottery.winner_percentage as u64) / 100;
        let treasury_share = total_prize_pool - winner_share;

        **lottery.to_account_info().try_borrow_mut_lamports()? -= winner_share;
        **ctx.accounts.winner.try_borrow_mut_lamports()? += winner_share;

        // Transfer to treasury
        **lottery.to_account_info().try_borrow_mut_lamports()? -= treasury_share;
        **ctx.accounts.treasury.try_borrow_mut_lamports()? += treasury_share;

        emit!(SendPrizeEmit {
            winner: ctx.accounts.winner.key(),
            prize: winner_share
        });

        let lottery_lamports = lottery.to_account_info().lamports();
        **lottery.to_account_info().lamports.borrow_mut() = 0;
        **ctx.accounts.authority.to_account_info().lamports.borrow_mut() += lottery_lamports;

        Ok(())
    }
}

fn calculate_winner_index(randomness: &[u8; 32], num_buyers: usize) -> usize {
    let mut seed = [0u8; 8];
    seed.copy_from_slice(&randomness[0..8]);
    let seed_u64 = u64::from_le_bytes(seed);
    (seed_u64 % num_buyers as u64) as usize
}

#[derive(Accounts)]
pub struct UpdateBypass<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateLottery<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 1 + 8 + 32 + 1 + 8 + 32 * 100 + 1)]
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Receives share of pool
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestRandomness<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
}

#[derive(Accounts)]
pub struct ProcessRandomness<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    /// CHECK: Receives share of pool
    #[account(mut)]
    pub winner: AccountInfo<'info>,
    /// CHECK: Receives share of pool
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendPrize<'info> {
    #[account(mut, close = authority)]
    pub lottery: Account<'info, Lottery>,
    /// CHECK: Receives share of pool
    #[account(mut)]
    pub winner: AccountInfo<'info>,
    /// CHECK: Receives share of pool
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Lottery {
    pub authority: Pubkey,
    pub ticket_price: u64,
    pub winner_percentage: u8,
    pub threshold: u64,
    pub treasury: Pubkey,
    pub randomness_requested: bool,
    pub prize_pool: u64,
    pub ticket_buyers: Vec<Pubkey>,
    pub bypass: bool,
    pub winner: Pubkey,
}

#[event]
pub struct LotteryCreated {
    pub lottery: Pubkey,
    pub authority: Pubkey,
    pub ticket_price: u64,
    pub winner_percentage: u8,
    pub threshold: u64,
    pub treasury: Pubkey,
}

#[event]
pub struct TicketsPurchased {
    pub lottery: Pubkey,
    pub buyer: Pubkey,
    pub num_tickets: u64,
    pub total_cost: u64,
}

#[event]
pub struct RandomnessRequested {
    pub lottery: Pubkey,
}

#[event]
pub struct RandomnessProcessed {
    pub lottery: Pubkey,
    pub winner: Pubkey,
}

#[event]
pub struct SendPrizeEmit {
    pub winner: Pubkey,
    pub prize: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Randomness has already been requested.")]
    RandomnessAlreadyRequested,
    #[msg("Randomness has not been requested yet.")]
    RandomnessNotRequested,
    #[msg("Prize pool does not meet the required threshold.")]
    ThresholdNotMet,
    #[msg("Numerical overflow occurred.")]
    NumericalOverflow,
    #[msg("No tickets sold.")]
    NoTicketsSold,
    #[msg("Invalid winner percentage.")]
    InvalidWinnerPercentage,
    #[msg("Winner Account Not Found.")]
    WinnerAccountNotFound,
}
