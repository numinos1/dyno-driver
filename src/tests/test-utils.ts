// ------------------------------------------------------------------
//      Testing Utilities
// ------------------------------------------------------------------

export function makeId(length: number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}