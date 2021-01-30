-- wypisanie listy członków klubu, posegregowanych wg statusu
select imie, nazwisko, status_nazwa.nazwa as status_czlonka from
(
    select * from czlonek join aktualny_status using(czlonek_id)
) czl join status_nazwa on(status=status_id)
order by status, czlonek_id;

-- wypisanie informacji o danym członku
    -- id, imię i nazwisko członka
    select imie, nazwisko from czlonek where czlonek_id=1;

    -- jaki ma aktualnie status
    select nazwa from aktualny_status join status_nazwa on(status=status_id) where czlonek_id=1;

    -- czy był w zarządzie (i kiedy) i jaką miał funkcję
    select pozycja_nazwa, data_od, data_do from (select czlonek_zarzadu.pozycja, data_od, data_do from czlonek_zarzadu join zarzad using(zarzad_id) where czlonek_id=1) pdd join pozycja_w_zarzadzie on pozycja=pozycja_w_zarzadzie.pozycja_id;

    -- lista wydarzeń w których brał udział/organizował
    select nazwa as funkcja, nazwa_wydarzenia, data_od, data_do from (select funkcja, nazwa as nazwa_wydarzenia, data_od, data_do from uczestnik join wydarzenie using(wydarzenie_id) where czlonek_id=1) fndd join uczestnik_funkcja on funkcja=uczestnik_funkcja_id;

    -- historia jego statusu
    select nazwa, data_od, data_do from status_czlonka join status_nazwa on status_czlonka.status = status_nazwa.status_id where czlonek_id=4 order by data_do;

    -- lista jego aktualnie wypożyczonych zasobów
    select nazwa_zasobu, nazwa, data_od from (select zasob_id, nazwa as nazwa_zasobu, typ_zasobu_id, data_od from aktualne_wypozyczenia join zasob using(zasob_id) where czlonek_id=6) zntd join typ_zasobu using(typ_zasobu_id);

    -- lista jego przetrzymanych zasobów
    select nazwa_zasobu, typ_zasobu, data_od from czlonek_przetrzymuje_zasob where czlonek_id=6;

    -- ile składek nie zapłacił
    select ominietych_skladek from liczba_ominietych_skladek where czlonek_id=1;

    -- lista spotkań cotygodniowych na których był obecny
    select oplacono_skladke, data from obecnosc join spotkanie using(spotkanie_id) where czlonek_id=1;

-- wypisanie członków zalegających z zapłatami
select imie, nazwisko, ominietych_skladek from liczba_ominietych_skladek join czlonek using(czlonek_id);

-- wypisuje członków przetrzymujących zasoby
select imie, nazwisko, nazwa_zasobu, typ_zasobu, data_od from czlonek_przetrzymuje_zasob;

-- wypisuje informacje o zasobach klubowych i przez kogą są aktualnie wypożyczone
select nazwa_zasobu, nazwa as typ, wydawca, uwagi, imie as imie_wypozyczajacego, nazwisko as nazwisko_wypozyczajacego from (
    select nazwa as nazwa_zasobu, typ_zasobu_id, wydawca, uwagi, imie, nazwisko from
    (
        select * from zasob left join (select * from wypozyczenie where data_do is null) wyp using (zasob_id)
    ) zw left join czlonek using (czlonek_id)
) ntwuin join typ_zasobu using (typ_zasobu_id)
