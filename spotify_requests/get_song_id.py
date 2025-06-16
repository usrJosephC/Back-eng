from table.table import filter_by_year

def get_song_id(year: int):
    '''returns a dictionary with the song ids starting from the year
     provided by the user.'''

    filtered_table = filter_by_year(year)

    if not filtered_table['URI']:
        return []

    return list(filtered_table['URI'])
