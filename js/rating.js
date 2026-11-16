/**
 * 开球网 (Kaiqiu) / USATT 积分计算规则
 * Available globally as window.RatingCalculator
 */
window.RatingCalculator = {
  /**
   * 根据两名选手的积分差，计算比赛胜负后的积分变动量
   * @param {number} rWinner 胜者积分
   * @param {number} rLoser 败者积分
   * @returns {{ winnerGain: number, loserLoss: number }}
   */
  calculateMatchDelta(rWinner, rLoser) {
    const diff = Math.abs(rWinner - rLoser);
    let delta = 8; // default delta for equal level

    if (rWinner >= rLoser) {
      // 高分者胜 (常规赢球，积分涨幅较小)
      if (diff <= 12) delta = 8;
      else if (diff <= 37) delta = 7;
      else if (diff <= 62) delta = 6;
      else if (diff <= 87) delta = 5;
      else if (diff <= 112) delta = 4;
      else if (diff <= 137) delta = 3;
      else if (diff <= 162) delta = 2;
      else if (diff <= 187) delta = 2;
      else if (diff <= 212) delta = 1;
      else delta = 0; // 差距过大 (>=213分) 正常赢球无积分奖励
    } else {
      // 低分者爆冷胜 (Underdog 获胜，奖励丰厚)
      if (diff <= 12) delta = 8;
      else if (diff <= 37) delta = 10;
      else if (diff <= 62) delta = 13;
      else if (diff <= 87) delta = 16;
      else if (diff <= 112) delta = 20;
      else if (diff <= 137) delta = 25;
      else if (diff <= 162) delta = 30;
      else if (diff <= 187) delta = 35;
      else if (diff <= 212) delta = 40;
      else delta = 50; // 巨大冷门封顶 50 分
    }

    return {
      winnerGain: delta,
      loserLoss: -delta
    };
  }
};
