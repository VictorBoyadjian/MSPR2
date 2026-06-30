import psycopg2, json, os
from datetime import datetime

CONNECTION_STRING = os.getenv('DATABASE_URL')

def getTableColumns(cursor, schema : str, table : str) -> tuple:
    cursor.execute(
        f"""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = '{schema}'
        AND table_name = '{table}';
        """
    )
    
    columns = []
    
    for row in cursor:
      columns.append(row) 
      
    return columns
    
def insertData(cursor, schema : str, table : str, datas : list) -> None :
    columns = getTableColumns(cursor, schema, table)
    
    if not columns: return

    for data in datas:
        print(data)
        placeholders = ','.join(['%s'] * len(data))
        cursor.execute(f'INSERT INTO "{schema}"."{table}" VALUES ({placeholders});', data)
    
def restore() -> None:
    if not CONNECTION_STRING : return
    
    con = psycopg2.connect(CONNECTION_STRING)
    
    if not con : return

    cursor = con.cursor()

    try:
        cursor.execute("SET session_replication_role = 'replica';")

        with open('./backup/backup-' + datetime.now().strftime('%Y-%m-%d-%H-%M-%S') + '.json', 'r', encoding='utf-8') as f:
            data = json.load(f)

            for schema in data:
                for table in data[schema]:
                    insertData(cursor, schema, table, data[schema][table])

        cursor.execute("SET session_replication_role = 'origin';")

        con.commit()
        
    except Exception as e:
        con.rollback()
        print(f"Erreur lors de la restauration, rollback effectue : {e}")
    finally:
        cursor.close()
        con.close()

restore()