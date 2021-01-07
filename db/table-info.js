const complexTableNames = ['spotkanie', 'obecnosc', 'zarzad', 'czlonek_zarzadu', 'wydarzenie', 'uczestnik'];
const complexFormNames = ['spotkanie_obecnosc', 'zarzad_czlonek_zarzadu', 'wydarzenie_uczestnik'];
const tableNamesWithAutonumeratedFirstId = ['czlonek', 'zarzad', 'status_nazwa', 'pozycja_w_zarzadzie', 'status_czlonka', 'typ_zasobu', 'zasob', 'uczestnik_funkcja', 'spotkanie', 'wydarzenie'];

module.exports = {complexTableNames, complexFormNames, tableNamesWithAutonumeratedFirstId};