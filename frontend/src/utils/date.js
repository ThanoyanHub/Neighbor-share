export const today = () => new Date().toISOString().slice(0,10);
export const currency = value => 'Rs ' + new Intl.NumberFormat(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(value || 0));
