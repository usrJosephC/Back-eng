from table.table import filter_by_year
from .spotify_auth import sp


def get_info(year: int):
    '''returns a dictionary with the song information starting from the year
     provided by the user.'''
   
    try:
        filtered_table = filter_by_year(year)
    except Exception as e:
        print(f"Erro ao filtrar tabela: {e}")
        return {"error": f"Erro ao filtrar tabela: {str(e)}"}


    # Extrai anos e URIs
    years = filtered_table['YEAR']
    uris = filtered_table['URI']
   
    # Prepara URIs para batch request
    track_uris = []
    for uri in uris:
        if not uri.startswith('spotify:track:'):
            track_uris.append(f'spotify:track:{uri}')
        else:
            track_uris.append(uri)
   
    # Divide em lotes de 50 (limite da API do Spotify)
    batch_size = 50
    info = {}
   
    for i in range(0, len(track_uris), batch_size):
        batch = track_uris[i:i+batch_size]
        current_years = years[i:i+batch_size]
       
        try:
            # Faz 1 request para até 50 músicas
            results = sp.tracks(batch)['tracks']
           
            for j, track in enumerate(results):
                current_year = current_years[j]
               
                if track is None:
                    info[current_year] = {
                        'artist_name': 'Erro: Música não encontrada',
                        'song_name': 'Erro: Música não encontrada',
                        'song_img': None,
                        'uri': batch[j]
                    }
                    continue
                   
                artist_name = track['artists'][0]['name']
                song_name = track['name']
                song_img = track['album']['images'][0]['url'] if track['album']['images'] else None


                info[current_year] = {
                    'artist_name': artist_name,
                    'song_name': song_name,
                    'song_img': song_img,
                    'uri': track['uri']
                }
               
        except Exception as e:
            print(f"Erro no batch {i//batch_size}: {e}")
            # Preenche informações básicas para todo o batch com erro
            for j in range(len(batch)):
                current_year = current_years[j]
                info[current_year] = {
                    'artist_name': 'Erro ao carregar',
                    'song_name': 'Erro ao carregar',
                    'song_img': None,
                    'uri': batch[j]
                }


    return info