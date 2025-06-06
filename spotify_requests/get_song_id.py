from table.table import filter_by_year

def get_song_id(year: int):
    '''returns a dictionary with the song ids starting from the year
     provided by the user.'''

    songs = {}
    filtered_table = filter_by_year(year)
    year = int(filtered_table['YEAR'][0])

    for uri in filtered_table['URI']:
        songs[year] = uri

        year += 1

    return songs
