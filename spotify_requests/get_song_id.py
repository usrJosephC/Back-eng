from table.table import filter_by_year

def get_song_id(year: int):
    '''returns a dictionary with the song ids starting from the year
     provided by the user.'''

    filtered_table = filter_by_year(year)

    if not filtered_table['YEAR'] or not filtered_table['URI']:
        return {}
    
    songs = {}
    chosen_year = int(filtered_table['YEAR'][0])

    for uri in filtered_table['URI']:
        songs[chosen_year] = uri

        chosen_year += 1

    return songs
