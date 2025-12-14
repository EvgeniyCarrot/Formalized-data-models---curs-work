const {Client} = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'FMD_CURS',
    password: 'Evgen2025GUI1',
    port: 5432,
});

async function runQuery(description, queryText){
    console.log(`\n ${description}`);
    console.log(`SQL ${queryText}`);
    try{
        const res = await client.query(queryText);
        if(res.rows.length === 0){
            console.log('Нет результатов');
        }
        else{
            console.log(`Найдено ${res.rows.length} записей:`);
            const fields = Object.keys(res.rows[0]);
            res.rows.forEach(row => {
                const rowString = fields
                    .map(field => `${field}: ${row[field]}`)
                    .join(' | ');
                console.log(` ${rowString}`);
            });
        }
    }
    catch (err){
        console.error('Ошибка выполнения запроса:', err.message);
    }
}

async function main(){
    try{
        await client.connect();
        console.log('Подключение к базе данных установлено.');
        await runQuery(
            '1. Экологичность > 3.5 и цена > 3.0',
            "SELECT id, team_name, price, eco_friendly FROM systeme WHERE eco_friendly > 3.5 AND price > 3.0;"
        );
        await runQuery(
            '2. Благоустройство >= 4.0 и близость к центру >= 3.7',
            "SELECT id, team_name, amenities, proximity_to_center FROM systeme WHERE amenities >= 4.0 AND proximity_to_center >= 3.7;"
        );
        await runQuery(
            '3. Качество застройки > 4.3',
            "SELECT id, team_name, construction_quality FROM systeme WHERE construction_quality > 4.3;"
        );
        await runQuery(
            '4. Недорогие компании (цена <=3.2) с высокой экологией (> 4.1)',
            "SELECT id, team_name, price, eco_friendly FROM systeme WHERE price < 3.2 AND eco_friendly > 4.1;"
        );
        await runQuery(
            '5. Компании, отсортированные по убыванию уровня застройки, чья цена ни меньше 3.5',
            "SELECT id, team_name, price, construction_quality FROM systeme WHERE price >= 3.5 ORDER BY construction_quality DESC;"
        );
    }
    catch (err){
        console.error('Ошибка подлючения', err.stack);
    }
    finally{
        await client.end();
        console.log('Соединение с базой данных закрыто.');
    }
}

main();
