import os
import pandas as pd

csv_path = os.path.join(os.path.dirname(__file__), 'music_table.csv')

table = pd.read_csv(csv_path)

# guarantees that the year column is numeric
# and that the year column is not empty
table['YEAR'] = pd.to_numeric(table['YEAR'], errors='coerce')

chosen_year = 1946 # has to come from frontend
filtered_table = table[table['YEAR'] >= chosen_year]
