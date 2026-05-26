/**
 * Chuyển đổi số thành chữ tiếng Việt
 */
export const numberToVietnameseWords = (amount: number): string => {
  if (amount === 0) return 'Không đồng';
  if (amount < 0) return 'Âm ' + numberToVietnameseWords(Math.abs(amount));

  const units = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  const readThreeDigits = (num: number, isLast: boolean): string => {
    let res = '';
    const hundred = Math.floor(num / 100);
    const ten = Math.floor((num % 100) / 10);
    const unit = num % 10;

    if (hundred > 0 || !isLast) {
      res += digits[hundred] + ' trăm ';
    }

    if (ten > 1) {
      res += digits[ten] + ' mươi ';
      if (unit === 1) res += 'mốt';
      else if (unit === 5) res += 'lăm';
      else if (unit > 0) res += digits[unit];
    } else if (ten === 1) {
      res += 'mười ';
      if (unit === 5) res += 'lăm';
      else if (unit > 0) res += digits[unit];
    } else if (ten === 0 && unit > 0) {
      if (hundred > 0 || !isLast) res += 'lẻ ';
      res += digits[unit];
    }

    return res.trim();
  };

  let res = '';
  let unitIdx = 0;
  let tempAmount = Math.floor(amount);

  while (tempAmount > 0) {
    const threeDigits = tempAmount % 1000;
    if (threeDigits > 0) {
      const part = readThreeDigits(threeDigits, tempAmount < 1000);
      res = part + units[unitIdx] + (res ? ' ' + res : '');
    }
    tempAmount = Math.floor(tempAmount / 1000);
    unitIdx++;
  }

  // Capitalize first letter and add "đồng"
  const result = res.trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
};
