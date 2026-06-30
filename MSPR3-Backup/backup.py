import psycopg2, json, os
from datetime import date, datetime
from decimal import Decimal
import uuid, schedule, time

CONNECTION_STRING = os.getenv('DATABASE_URL')

def getSchemaTables(cursor, schemas : list) -> dict :
    schemasTables = {}
    
    for schema in schemas:
        schemasTables[schema] = []
        
        cursor.execute(
            f"""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = '{schema}'
            AND table_type = 'BASE TABLE';
            """
        )
        
        for data in cursor.fetchall():
            schemasTables[schema].append(tuple(data)[0])
            
    return schemasTables
        
def getTableData(cursor, schema : str, table : str):
    cursor.execute(f'SELECT * from "{schema}".{table}')
    
    for row in cursor:
        yield row

def json_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, uuid.UUID):
        return str(obj)
    if isinstance(obj, (bytes, memoryview)):
        return bytes(obj).hex()
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")
        
def backup():
    if(not CONNECTION_STRING) : return
    
    con = psycopg2.connect(CONNECTION_STRING)
    
    if(not con) : return
    
    cursor = con.cursor()
        
    schemasTables = getSchemaTables(cursor, ['Data', 'System'])
    
    schemasTablesDatas = {}
    
    for schema in schemasTables:
        if not schema in schemasTablesDatas:
            schemasTablesDatas[schema] = {}
        for table in schemasTables[schema]:
            if not table in schemasTablesDatas[schema]:
                schemasTablesDatas[schema][table] = []
            
            for row in getTableData(cursor, schema, table):
                schemasTablesDatas[schema][table].append(row)
    
    with open('./backup/backup-' + datetime.now().strftime('%Y-%m-%d-%H-%M-%S') + '.json', 'w', encoding='utf-8') as f:
        json.dump(schemasTablesDatas, f, ensure_ascii=False, indent=4, default=json_serializer)
    
    cursor.close()
    con.close()
    
if __name__ == '__main__':
    print('Backup every day at 23:59.')
    
    schedule.every().day.at("23:59").do(backup)
    while True:
        schedule.run_pending()
        time.sleep(60)