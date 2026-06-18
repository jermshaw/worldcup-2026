// Maps football-data.org venue (stadium) names to host cities
const STADIUM_CITY: Record<string, string> = {
  'Azteca':                    'Mexico City',
  'Estadio BBVA':              'Monterrey',
  'AKRON':                     'Guadalajara',
  'AT&T Stadium':              'Dallas',
  'NRG Stadium':               'Houston',
  'Arrowhead Stadium':         'Kansas City',
  'Mercedes-Benz Stadium':     'Atlanta',
  'Hard Rock Stadium':         'Miami',
  'Gillette Stadium':          'Boston',
  'Lincoln Financial Field':   'Philadelphia',
  'MetLife Stadium':           'New York',
  'BMO Field':                 'Toronto',
  'BC Place':                  'Vancouver',
  'Lumen Field':               'Seattle',
  "Levi's Stadium":            'Santa Clara',
  'SoFi Stadium':              'Los Angeles',
};

export function getCityForVenue(venue: string): string {
  return STADIUM_CITY[venue] ?? venue;
}
