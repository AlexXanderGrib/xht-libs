import { emoji, namesOf } from './emoji';
describe('Emoji', () => {
  test('Reverse search', () => {
    const name: keyof typeof emoji = '8ball';
    const foundNames = namesOf(emoji[name]);

    console.log(foundNames);

    expect(foundNames.includes(name)).toBeTruthy();
  });
});
