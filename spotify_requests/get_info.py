from table.table import filter_by_year

def get_info(sp, year: int):
    '''returns a dictionary with the song information starting from the year
     provided by the user.'''

    info = {}
    filtered_table = filter_by_year(year)
    year = int(filtered_table['YEAR'][0])

    for uri in filtered_table['URI']:
        track = sp.track(uri)

        artist_name = track['artists'][0]['name']
        song_name = track['name']
        song_img = track['album']['images'][0]['url']

        info[year] = {
            'artist_name': artist_name,
            'song_name': song_name,
            'song_img': song_img
        }

        year += 1

    return info
