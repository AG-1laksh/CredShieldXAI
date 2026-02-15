export function getValidationHints(formData, language = 'en') {
  const hi = language === 'hi';
  const hints = [];

  if ((formData.age ?? 0) < 21) {
    hints.push(
      hi
        ? 'बहुत कम आयु वाले आवेदकों को कई ऋणदाता अधिक जोखिम मानते हैं।'
        : 'Very young applicant profiles can be considered higher risk by many lenders.',
    );
  }

  if ((formData.credit_amount ?? 0) > 15000 && (formData.duration ?? 0) < 18) {
    hints.push(
      hi
        ? 'उच्च लोन राशि और कम भुगतान अवधि से मासिक बोझ बढ़ सकता है।'
        : 'High loan amount with short repayment time may create heavy monthly burden.',
    );
  }

  if ((formData.installment_commitment ?? 0) >= 4) {
    hints.push(
      hi
        ? 'मासिक किस्त का भार अधिक है; राशि घटाएँ या अवधि बढ़ाएँ।'
        : 'Monthly installment burden is high; consider reducing amount or extending tenure.',
    );
  }

  if (formData.employment === 'unemployed' && (formData.credit_amount ?? 0) > 6000) {
    hints.push(
      hi
        ? 'बेरोज़गार स्थिति में बड़ी लोन राशि से स्वीकृति की संभावना घट सकती है।'
        : 'Unemployed status with a large loan request may reduce approval confidence.',
    );
  }

  if (formData.savings_status === '<100' && (formData.credit_amount ?? 0) > 10000) {
    hints.push(
      hi
        ? 'कम बचत और अधिक लोन राशि से भुगतान क्षमता पर भरोसा कम हो सकता है।'
        : 'Low savings plus high loan amount may weaken repayment confidence.',
    );
  }

  if ((formData.existing_credits ?? 1) >= 3) {
    hints.push(
      hi
        ? 'एक से अधिक सक्रिय लोन जोखिम बढ़ा सकते हैं; बकाया दायित्व की समीक्षा करें।'
        : 'Multiple active loans can increase risk; review outstanding obligations.',
    );
  }

  return hints;
}
