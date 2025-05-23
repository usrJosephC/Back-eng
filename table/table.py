import os
import pandas as pd

csv_path = os.path.join(os.path.dirname(__file__), 'music_table.csv')

table = pd.read_csv(csv_path)

# guarantees that the year column is numeric
# and that the year column is not empty
table['YEAR'] = pd.to_numeric(table['YEAR'], errors='coerce')

def filter_by_year(year: int):
    '''filters the table by the year provided by the user.'''
    filtered = table[table['YEAR'] >= year]
    return filtered.to_dict(orient='list')
