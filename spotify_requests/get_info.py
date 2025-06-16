from table.table import filter_by_year

def get_info(chosen_year: int):
    '''Returns a dictionary with the song information starting from the year
    provided by the user, using data from the local CSV table.'''

    info = {}
    filtered_table = filter_by_year(chosen_year)
    year_list = filtered_table['YEAR']
    song_list = filtered_table['SONG']
    artist_list = filtered_table['ARTIST']
    song_img_list = filtered_table['SONG_IMG']
    track_duration_list = filtered_table['TRACK_DURATION']

    for i, year in enumerate(year_list):
        info[int(year)] = {
            'song_name': song_list[i],
            'artist_name': artist_list[i],
            'track_duration': track_duration_list[i],
            'song_img': song_img_list[i],
        }

    return info
