// Цены прочитаны с фото меню и могут отличаться от реальных.
const RAW = [
  ['Dönər toyuq', [['Çörək dönər', 3], ['Lavaş dönər', 3.5], ['Bruzdovi dönər', 4], ['Tandırda dönər', 4.5], ['Pratzon dönər', 5], ['Kartof-dönər', 5], ['Tələbə dönər', 4]]],
  ['Dönər ət', [['Çörək dönər ət', 3.5], ['Lavaş dönər ət', 4], ['Pitaton', 5], ['İskəndər', 7]]],
  ['Şaurma', [['Şaurma toyuq çörəkdə', 3.5], ['Şaurma toyuq lavaşda', 4], ['Şaurma ət çörəkdə', 4.2], ['Şaurma ət lavaşda', 4.5]]],
  ['Lahmacun', [['Adi lahmacun', 3], ['Soğanlı lahmacun', 3.5], ['Pendirli lahmacun', 4], ['Beykoz lahmacun', 5.5], ['Qarışıq lahmacun', 5], ['İçli lahmacun', 4.5]]],
  ['Toyuq yeməkləri', [['Toyuq şiş', 8], ['Toyuq qanad', 7], ['Toyuq göbələkli', 8], ['Toyuq qarışıq', 9]]],
  ['Ət yeməkləri', [['Ət şiş', 10], ['Ət sote', 10], ['Adana kabab', 9], ['Qarışıq kabab', 12]]],
  ['Pizza', [['Marqarita', 9], ['Sucuklu', 10], ['Qarışıq', 12], ['Ət pizza', 13], ['Beykoz pizza', 14]]],
  ['Pide', [['Qaymaqlı pide', 6], ['Qıyməli pide', 7], ['Sucuqlu pide', 7], ['Pendirli pide', 6]]],
  ['Fast food', [['Hamburger', 3], ['Çizburger', 3.5], ['Fri kartof', 2.5], ['Naggets', 4]]],
  ['Salatlar', [['Mövsümi salat', 4], ['Yerbənd salatı', 4], ['Çoban salatı', 4.5], ['Yunan salatı', 5]]],
  ['Sorbalar', [['Mərcimək şorba', 3], ['Toyuq şorbası', 3.5], ['Ezogelin', 3], ['Düyü şorba', 3]]],
  ['İçəcəklər', [['Coca-Cola', 1.5], ['Coca-Cola 1L', 2.5], ['Coca-Cola 2L', 3.5], ['Fanta 1L', 2.5], ['Fanta', 1.5], ['Sprite', 1.5], ['Su', 0.7], ['Ayran', 1.5], ['Çay', 1], ['Fuse tea', 2]]],
  ['Sinilər', [['Qarışıq sini', 10], ['Şirniyyat', 4], ['Baklava', 5]]],
]

export const MENU = RAW.map(([title, items]) => ({
  title,
  items: items.map(([name, base]) => ({ id: `${title}|${name}`, name, base })),
}))

export const NAMES = ['Пашаев', 'Ислам', 'Исмаил', 'Сархан', 'Ряван', 'Сабир', 'Руслан', 'Ахмед', 'Чахлуев', 'Низами', 'Кянан', 'Асим', 'Надир', 'Ниджат']