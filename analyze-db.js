const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  database: 'FMD_CURS',
  user: 'postgres',
  password: 'Evgen2025GUI1',
  port: 5432,
});

function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  console.log(` ${title}`);
  console.log('='.repeat(60));
}

async function main() {
  try {
    await client.connect();
    console.log(' Подключение к базе данных установлено.\n');

    printHeader('1. Описательная статистика по всем критериям');
    const statsRes = await client.query(`
      SELECT
        COUNT(*)::int AS total_companies,
        ROUND(AVG(price), 2) AS avg_price,
        ROUND(AVG(eco_friendly), 2) AS avg_eco,
        ROUND(AVG(amenities), 2) AS avg_amenities,
        ROUND(AVG(proximity_to_center), 2) AS avg_center,
        ROUND(AVG(construction_quality), 2) AS avg_quality
      FROM systeme;
    `);
    const stats = statsRes.rows[0];
    console.log(`Всего компаний: ${stats.total_companies}`);
    console.log(`Средняя цена: ${stats.avg_price}`);
    console.log(`Средняя экологичность: ${stats.avg_eco}`);
    console.log(`Среднее благоустройство: ${stats.avg_amenities}`);
    console.log(`Средняя близость к центру: ${stats.avg_center}`);
    console.log(`Среднее качество застройки: ${stats.avg_quality}`);

    printHeader('2. Топ-5 компаний по качеству застройки');
    const topQuality = await client.query(`
      SELECT team_name, construction_quality
      FROM systeme
      ORDER BY construction_quality DESC
      LIMIT 5;
    `);
    topQuality.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.team_name} — ${row.construction_quality}`);
    });

    printHeader('3. Эко-лидеры (экологичность > 4.5)');
    const ecoLeaders = await client.query(`
      SELECT team_name, eco_friendly
      FROM systeme
      WHERE eco_friendly > 4.5
      ORDER BY eco_friendly DESC;
    `);
    if (ecoLeaders.rows.length > 0) {
      ecoLeaders.rows.forEach(row => {
        console.log(` ${row.team_name} — ${row.eco_friendly}`);
      });
    } else {
      console.log('Нет компаний с экологичностью выше 4.5');
    }

    printHeader('4. Бюджетные и экологичные компании');
    const budgetEco = await client.query(`
      SELECT team_name, price, eco_friendly
      FROM systeme
      WHERE price <= 3.2 AND eco_friendly > 4.1
      ORDER BY eco_friendly DESC;
    `);
    if (budgetEco.rows.length > 0) {
      budgetEco.rows.forEach(row => {
        console.log(` ${row.team_name} | Цена: ${row.price} | Экология: ${row.eco_friendly}`);
      });
    } else {
      console.log('Нет компаний, сочетающих низкую цену и высокую экологичность');
    }

    printHeader('5. Топ-5 по сбалансированному индексу');
    console.log('(Индекс = (5 - цена + благоустройство + экология + центр + качество) / 5)');
    const balanced = await client.query(`
      SELECT
        team_name,
        ROUND((
          (5.0 - price) +
          amenities +
          eco_friendly +
          proximity_to_center +
          construction_quality
        ) / 5.0, 2) AS balanced_score
      FROM systeme
      ORDER BY balanced_score DESC
      LIMIT 5;
    `);
    balanced.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.team_name} — ${row.balanced_score}`);
    });

    printHeader('6. Проверка качества данных');
    const badData = await client.query(`
      SELECT COUNT(*) AS bad_rows
      FROM systeme
      WHERE price < 0 OR price > 5
         OR eco_friendly < 0 OR eco_friendly > 5
         OR amenities IS NULL;
    `);
    const badCount = parseInt(badData.rows[0].bad_rows);
    if (badCount === 0) {
      console.log(' Все данные находятся в допустимом диапазоне [0.0–5.0] и заполнены.');
    } else {
      console.log(` Обнаружено ${badCount} записей с некорректными данными.`);
    }

  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    await client.end();
    console.log('\n Соединение с базой данных закрыто.');
  }
}

main();