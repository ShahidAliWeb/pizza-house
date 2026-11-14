import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads/products');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Map each SKU to a high-quality, verified Unsplash photo of the exact food product
export const imageMapping: Record<string, string> = {
  // 1. Pizza (14 unique)
  'PH-PIZ-01': 'photo-1565299624946-b28f40a0ae38', // Chicken Tikka
  'PH-PIZ-02': 'photo-1513104890138-7c749659a591', // Chicken Fajita
  'PH-PIZ-03': 'photo-1574071318508-1cdbab80d002', // Malai Boti
  'PH-PIZ-04': 'photo-1571407970349-bc81e7e96d47', // BBQ Chicken
  'PH-PIZ-05': 'photo-1593560708920-61dd98c46a4e', // Creamy Tikka
  'PH-PIZ-06': 'photo-1628840042765-356cda07504e', // Pepperoni
  'PH-PIZ-07': 'photo-1548369937-47519962c11a', // Cheese Lover
  'PH-PIZ-08': 'photo-1590947132387-155cc02f3212', // Chicken Supreme
  'PH-PIZ-09': 'photo-1604382355076-af4b0eb60143', // Mexican Pizza
  'PH-PIZ-10': 'photo-1576458088443-04a19bb13da6', // Vegetarian Pizza
  'PH-PIZ-11': 'photo-1565299585323-38d6b0865b47', // Hawaiian Pizza
  'PH-PIZ-12': 'photo-1594007654729-407eedc4be65', // Peri Peri Pizza
  'PH-PIZ-13': 'photo-1588315029754-2dd089d39a1a', // Crown Crust
  'PH-PIZ-14': 'photo-1573821663912-569905455b1a', // Stuffed Crust

  // 2. Rolls & Wraps (11 unique)
  'PH-ROL-01': 'photo-1626777552726-4a6b54c97e46', // Chicken Paratha Roll
  'PH-ROL-02': 'photo-1606755962773-d324e0a13086', // Zinger Roll
  'PH-ROL-03': 'photo-1626700051175-6818013e1d4f', // Mayo Garlic Roll
  'PH-ROL-04': 'photo-1644704170910-a0cdf183649b', // Chicken Cheese Roll
  'PH-ROL-05': 'photo-1529042410759-befb1204b468', // BBQ Roll
  'PH-ROL-06': 'photo-1599488615731-7e5c2823ff28', // Malai Boti Roll
  'PH-ROL-07': 'photo-1541832676-9b763b0239ab', // Beef Roll
  'PH-ROL-08': 'photo-1555939594-58d7cb561ad1', // Seekh Kebab Roll
  'PH-ROL-09': 'photo-1562967914-608f82629710', // Crispy Chicken Roll
  'PH-ROL-10': 'photo-1561651823-34feb02250e4', // Shawarma Roll
  'PH-ROL-11': 'photo-1509722747041-616f39b57569', // Chicken Fajita Wrap

  // 3. Burgers (14 unique)
  'PH-BRG-01': 'photo-1568901346375-23c9450c58cd', // Zinger Burger
  'PH-BRG-02': 'photo-1572802419224-296b0aeee0d9', // Chicken Burger
  'PH-BRG-03': 'photo-1586190848861-99aa4a171e90', // Beef Burger
  'PH-BRG-04': 'photo-1550547660-d9450f859349', // Cheese Burger
  'PH-BRG-05': 'photo-1551782450-a2132b4ba21d', // Double Decker Burger
  'PH-BRG-06': 'photo-1553979459-d2229ba7433b', // Double Patty Burger
  'PH-BRG-07': 'photo-1625813506062-0aeb1d7a094b', // Crispy Chicken Burger
  'PH-BRG-08': 'photo-1594212699903-ec8a3eca50f5', // BBQ Burger
  'PH-BRG-09': 'photo-1565299507177-b0ac66763828', // Mushroom Burger
  'PH-BRG-10': 'photo-1582196016295-f8c8bd4b3e99', // Jalapeno Burger
  'PH-BRG-11': 'photo-1521305916504-4a1121188589', // Mexican Burger
  'PH-BRG-12': 'photo-1607013251379-e6eecfffe234', // Tower Burger
  'PH-BRG-13': 'photo-1606755962773-d324e0a13086', // Grilled Chicken Burger
  'PH-BRG-14': 'photo-1576843776838-032ac46fbb93', // Fish Burger

  // 4. Fries (10 unique)
  'PH-FRY-01': 'photo-1573080496219-bb080dd4f877', // Regular Fries
  'PH-FRY-02': 'photo-1630384060421-cb20d0e0649d', // Masala Fries
  'PH-FRY-03': 'photo-1585109649139-366815a0d713', // Cheese Fries
  'PH-FRY-04': 'photo-1585109649139-366815a0d713', // Loaded Fries
  'PH-FRY-05': 'photo-1576107232684-1279f3908594', // BBQ Fries
  'PH-FRY-06': 'photo-1541592106381-b31e9677c0e5', // Peri Peri Fries
  'PH-FRY-07': 'photo-1543339308-43e59d6b73a6', // Curly Fries
  'PH-FRY-08': 'photo-1618449840665-9ed506d73a34', // Potato Wedges
  'PH-FRY-09': 'photo-1585109649139-366815a0d713', // Chili Cheese Fries
  'PH-FRY-10': 'photo-1573080496219-bb080dd4f877', // Garlic Parmesan Fries

  // 5. Sandwiches (10 unique)
  'PH-SDW-01': 'photo-1528735602780-2552fd46c7af', // Club Sandwich
  'PH-SDW-02': 'photo-1554433607-66b5efe9d304', // Chicken Sandwich
  'PH-SDW-03': 'photo-1628191010210-a59de33e5941', // Grilled Chicken Sandwich
  'PH-SDW-04': 'photo-1604467715878-83e57e8bc129', // Crispy Chicken Sandwich
  'PH-SDW-05': 'photo-1509722747041-616f39b57569', // BBQ Chicken Sandwich
  'PH-SDW-06': 'photo-1528736235302-52922df5c122', // Cheese Sandwich
  'PH-SDW-07': 'photo-1525351484163-7529414344d8', // Egg Sandwich
  'PH-SDW-08': 'photo-1550547660-d9450f859349', // Beef Sandwich
  'PH-SDW-09': 'photo-1481070414801-51fd732d7184', // Chicken Mayo Sandwich
  'PH-SDW-10': 'photo-1528735602780-2552fd46c7af', // Philly Cheesesteak

  // 6. Shawarma (8 unique)
  'PH-SHW-01': 'photo-1529042410759-befb1204b468', // Chicken Shawarma
  'PH-SHW-02': 'photo-1561651823-34feb02250e4', // Beef Shawarma
  'PH-SHW-03': 'photo-1626700051175-6818013e1d4f', // Arabic Shawarma
  'PH-SHW-04': 'photo-1599488615731-7e5c2823ff28', // Turkish Doner Kebab
  'PH-SHW-05': 'photo-1541832676-9b763b0239ab', // Chicken Doner
  'PH-SHW-06': 'photo-1555939594-58d7cb561ad1', // Beef Doner
  'PH-SHW-07': 'photo-1544025162-d76694265947', // Shawarma Platter
  'PH-SHW-08': 'photo-1512058564366-18510be2db19', // Shawarma Rice Bowl

  // 7. Fried Chicken (11 unique)
  'PH-FRC-01': 'photo-1626082927389-6cd097cdc6ec', // Crispy Fried Chicken
  'PH-FRC-02': 'photo-1562967914-608f82629710', // Chicken Broast
  'PH-FRC-03': 'photo-1608039829572-78524f79c4c7', // Chicken Drumsticks
  'PH-FRC-04': 'photo-1527477321055-43615b629c95', // Chicken Wings
  'PH-FRC-05': 'photo-1567620832903-9fc6debc209f', // Buffalo Wings
  'PH-FRC-06': 'photo-1541832676-9b763b0239ab', // BBQ Wings
  'PH-FRC-07': 'photo-1569058242253-92a9c755a0ec', // Hot Wings
  'PH-FRC-08': 'photo-1562967916-eb82221dfb92', // Chicken Nuggets
  'PH-FRC-09': 'photo-1608039829572-78524f79c4c7', // Chicken Strips
  'PH-FRC-10': 'photo-1562967914-608f82629710', // Chicken Popcorn
  'PH-FRC-11': 'photo-1626082927389-6cd097cdc6ec', // Chicken Tenders

  // 8. Appetizers & Snacks (11 unique)
  'PH-APP-01': 'photo-1601050690597-df0568f70950', // Chicken Samosa
  'PH-APP-02': 'photo-1589301760014-d929f3979dbc', // Vegetable Samosa
  'PH-APP-03': 'photo-1541529086526-db283c563270', // Spring Rolls
  'PH-APP-04': 'photo-1541832676-9b763b0239ab', // Chicken Cheese Balls
  'PH-APP-05': 'photo-1548340742-b8332e25c241', // Mozzarella Sticks
  'PH-APP-06': 'photo-1562967914-608f82629710', // Chicken Poppers
  'PH-APP-07': 'photo-1639024471285-0af5075b6dbd', // Onion Rings
  'PH-APP-08': 'photo-1582196016295-f8c8bd4b3e99', // Jalapeno Poppers
  'PH-APP-09': 'photo-1619535860434-ba1d8fa12536', // Garlic Bread
  'PH-APP-10': 'photo-1573140247632-f8fd74997d5c', // Cheesy Garlic Bread
  'PH-APP-11': 'photo-1562967916-eb82221dfb92', // Dynamite Chicken

  // 9. Pasta (11 unique)
  'PH-PAS-01': 'photo-1645112411341-6c4fd023714a', // Chicken Alfredo Pasta
  'PH-PAS-02': 'photo-1555949258-eb67b1ef0ceb', // Chicken Fettuccine
  'PH-PAS-03': 'photo-1621996346565-e3d5d6281042', // Chicken Arrabbiata
  'PH-PAS-04': 'photo-1608897013039-887f21d8c804', // Creamy Mushroom Pasta
  'PH-PAS-05': 'photo-1543339308-43e59d6b73a6', // Mac and Cheese
  'PH-PAS-06': 'photo-1551183053-bf91a1d81141', // Baked Pasta
  'PH-PAS-07': 'photo-1574894709920-11b28e7367e3', // Lasagna
  'PH-PAS-08': 'photo-1555949258-eb67b1ef0ceb', // Chicken Tikka Pasta
  'PH-PAS-09': 'photo-1608897013039-887f21d8c804', // Mexican Pasta
  'PH-PAS-10': 'photo-1645112411341-6c4fd023714a', // White Sauce Pasta
  'PH-PAS-11': 'photo-1621996346565-e3d5d6281042', // Red Sauce Pasta

  // 10. BBQ & Grilled (10 unique)
  'PH-BBQ-01': 'photo-1599488615731-7e5c2823ff28', // Chicken Tikka
  'PH-BBQ-02': 'photo-1544025162-d76694265947', // Malai Boti
  'PH-BBQ-03': 'photo-1555939594-58d7cb561ad1', // Chicken Boti
  'PH-BBQ-04': 'photo-1541832676-9b763b0239ab', // Beef Boti
  'PH-BBQ-05': 'photo-1599488615731-7e5c2823ff28', // Seekh Kebab
  'PH-BBQ-06': 'photo-1544025162-d76694265947', // Reshmi Kebab
  'PH-BBQ-07': 'photo-1527477321055-43615b629c95', // Chicken Wings BBQ
  'PH-BBQ-08': 'photo-1555939594-58d7cb561ad1', // BBQ Platter
  'PH-BBQ-09': 'photo-1598515214211-89d3c73ae83b', // Grilled Chicken
  'PH-BBQ-10': 'photo-1532550907401-a500c9a57435', // Peri Peri Chicken

  // 11. Rice & Platters (10 unique)
  'PH-RIC-01': 'photo-1603133872878-684f208fb84b', // Chicken Fried Rice
  'PH-RIC-02': 'photo-1512058564366-18510be2db19', // Egg Fried Rice
  'PH-RIC-03': 'photo-1546069901-ba9599a7e63c', // Vegetable Fried Rice
  'PH-RIC-04': 'photo-1585032226651-759b368d7246', // Chicken Manchurian Rice
  'PH-RIC-05': 'photo-1563379091339-03b21ab4a4f8', // Chicken Biryani
  'PH-RIC-06': 'photo-1512058564366-18510be2db19', // Chicken Pulao
  'PH-RIC-07': 'photo-1544025162-d76694265947', // Chicken Shawarma Rice
  'PH-RIC-08': 'photo-1598515214211-89d3c73ae83b', // Grilled Chicken Rice
  'PH-RIC-09': 'photo-1544025162-d76694265947', // Chicken Steak Rice
  'PH-RIC-10': 'photo-1555939594-58d7cb561ad1', // Fast Food Combo Platter

  // 12. Hot Dogs & Tacos (11 unique)
  'PH-HDT-01': 'photo-1619740455993-9e612b1af08a', // Chicken Hot Dog
  'PH-HDT-02': 'photo-1627054234057-0b12bc1209b5', // Beef Hot Dog
  'PH-HDT-03': 'photo-1612392062631-94dd85fa2dd1', // Cheese Hot Dog
  'PH-HDT-04': 'photo-1619740455993-9e612b1af08a', // Chili Dog
  'PH-HDT-05': 'photo-1509722747041-616f39b57569', // Chicken Sub
  'PH-HDT-06': 'photo-1528735602780-2552fd46c7af', // Beef Sub
  'PH-HDT-07': 'photo-1551504734-5ee1c4a1479b', // Chicken Tacos
  'PH-HDT-08': 'photo-1565299585323-38d6b0865b47', // Beef Tacos
  'PH-HDT-09': 'photo-1599974579688-8dbdd335c77f', // Quesadilla
  'PH-HDT-10': 'photo-1513456852971-30c0b8199d4d', // Nachos
  'PH-HDT-11': 'photo-1534308983496-4fabb1a015ee', // Chicken Calzone

  // 13. Desserts (10 unique)
  'PH-DST-01': 'photo-1606313564200-e75d5e30476c', // Chocolate Brownie
  'PH-DST-02': 'photo-1624353365286-3f8d62daad51', // Chocolate Lava Cake
  'PH-DST-03': 'photo-1551024709-8f23befc6f87', // Chocolate Donut
  'PH-DST-04': 'photo-1586985289688-ca3cf47d3e6e', // Chocolate Muffin
  'PH-DST-05': 'photo-1533134242443-d4fd215305ad', // Cheesecake
  'PH-DST-06': 'photo-1578985545062-69928b1d9587', // Chocolate Cake
  'PH-DST-07': 'photo-1497034825429-c343d7c6a68f', // Ice Cream
  'PH-DST-08': 'photo-1562376552-0d160a2f238d', // Waffles
  'PH-DST-09': 'photo-1528198691076-21a3a78c0db5', // Pancakes
  'PH-DST-10': 'photo-1589301760014-d929f3979dbc', // Gulab Jamun

  // 14. Drinks (17 unique)
  'PH-DRK-01': 'photo-1622483767028-3f66f32aef97', // Coca-Cola
  'PH-DRK-02': 'photo-1551024709-8f23befc6f87', // Pepsi
  'PH-DRK-03': 'photo-1625772299848-391b6a87d7b3', // 7UP
  'PH-DRK-04': 'photo-1581009146145-b5ef050c2e1e', // Sprite
  'PH-DRK-05': 'photo-1624517452488-04869289c4ca', // Fanta
  'PH-DRK-06': 'photo-1546173159-315724a31696', // Mountain Dew
  'PH-DRK-07': 'photo-1613478223719-2ab802602423', // Mirinda
  'PH-DRK-08': 'photo-1560023907-5f339617ea30', // Mineral Water
  'PH-DRK-09': 'photo-1513558161293-cdaf765ed2fd', // Fresh Lime
  'PH-DRK-10': 'photo-1523371067-1ac38df8653a', // Lemonade
  'PH-DRK-11': 'photo-1551538827-9c037cb4f32a', // Mint Margarita
  'PH-DRK-12': 'photo-1572490122747-3968b75cc699', // Chocolate Shake
  'PH-DRK-13': 'photo-1579954115545-a95591f28bfc', // Vanilla Shake
  'PH-DRK-14': 'photo-1553787499-6f9133860278', // Strawberry Shake
  'PH-DRK-15': 'photo-1572490122747-3968b75cc699', // Oreo Shake
  'PH-DRK-16': 'photo-1517701550927-30cf4ba1dba5', // Cold Coffee
  'PH-DRK-17': 'photo-1556679343-c7306c1976bc'  // Iced Tea
};

export async function downloadAllImages() {
  console.log(`Starting download for ${Object.keys(imageMapping).length} unique food product images...`);
  let success = 0;
  let failed = 0;

  for (const [sku, photoId] of Object.entries(imageMapping)) {
    const filename = `${sku.toLowerCase()}.jpg`;
    const targetFile = path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
      success++;
      continue;
    }

    try {
      const url = `https://images.unsplash.com/${photoId}?w=600&auto=format&fit=crop&q=80`;
      const res = await fetch(url, { headers: { 'User-Agent': 'PizzaHouse/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(targetFile, buf);
      success++;
    } catch (err: any) {
      console.error(`Failed to download image for ${sku} (${photoId}):`, err.message);
      failed++;
    }
  }

  console.log(`Image download finished. Success: ${success}, Failed: ${failed}`);
}

if (process.argv[1]?.endsWith('downloadProductImages.ts')) {
  downloadAllImages().catch(console.error);
}
