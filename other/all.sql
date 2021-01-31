------------------------------------------------
-------------------- Tabele --------------------
------------------------------------------------

create table czlonek
(
    czlonek_id serial not null
		constraint czlonek_pk
			primary key,
	imie varchar not null,
	nazwisko varchar not null

);

create table zarzad
(
	zarzad_id serial
		constraint zarzad_pk
			primary key,
	data_od date not null,
	data_do date
);


create table pozycja_w_zarzadzie
(
    pozycja_id serial not null unique primary key,
    pozycja_nazwa varchar not null
);

create table czlonek_zarzadu
(
	zarzad_id int not null
		constraint czlonek_zarzadu_zarzad_zarzad_id_fk
			references zarzad
				on update cascade on delete set null,
	czlonek_id int not null
		constraint czlonek_zarzadu_czlonek_czlonek_id_fk
			references czlonek
				on update cascade on delete set null,
	pozycja int not null
	    references pozycja_w_zarzadzie (pozycja_id)
	        on update cascade on delete set null,
	constraint czlonek_zarzadu_pk
		primary key (zarzad_id, czlonek_id, pozycja)
);

create table status_nazwa
(
    status_id serial not null unique
        constraint status_nazwa_pk
            primary key,
    nazwa varchar not null
);

create table status_czlonka
(
	status_czlonka_id serial
		constraint status_czlonka_pk
			primary key,
	data_od date not null,
	data_do date,
	czlonek_id int not null
		constraint status_czlonka_czlonek_czlonek_id_fk
			references czlonek
				on update cascade on delete set null,
	status int not null
		constraint status_czlonka_status_nazwa_status_id_fk
			references status_nazwa (status_id)
				on update cascade on delete set null
);

create table spotkanie
(
    spotkanie_id serial not null
        constraint spotkanie_pk
            primary key,
    data date not null
);

create table obecnosc
(
	czlonek_id int not null
		constraint obecnosc_czlonek_czlonek_id_fk
			references czlonek
				on update cascade on delete set null,
	spotkanie_id int not null
		constraint obecnosc_spotkanie_spotkanie_id_fk
			references spotkanie
				on update cascade on delete set null,
	oplacono_skladke bool not null,
	constraint obecnosc_pk
		primary key (czlonek_id, spotkanie_id)
);

create table typ_zasobu
(
	typ_zasobu_id serial not null unique
		constraint typ_zasobu_pk
			primary key,
	nazwa varchar not null,
	opis varchar
);

create table zasob
(
	zasob_id serial not null
		constraint zasob_pk
			primary key,
	typ_zasobu_id int not null
		constraint zasob_typ_zasobu_typ_zasobu_id_fk
			references typ_zasobu (typ_zasobu_id)
				on update cascade on delete set null,
	nazwa varchar not null,
	wydawca varchar not null,
	uwagi varchar
);

create table wypozyczenie
(
	zasob_id int not null
		constraint wypozyczenie_zasob_zasob_id_fk
			references zasob
				on update cascade on delete set null,
	czlonek_id int not null
		constraint wypozyczenie_czlonek_czlonek_id_fk
			references czlonek
				on update cascade on delete set null,
	data_od date not null,
	data_do date,
	constraint wypozyczenie_pk
		primary key (zasob_id, czlonek_id, data_od)
);

create table wydarzenie
(
	wydarzenie_id serial not null
		constraint wydarzenie_pk
			primary key,
	nazwa varchar not null,
	motyw_przewodni varchar,
	data_od date not null,
	data_do date not null
);

create table uczestnik_funkcja
(
	uczestnik_funkcja_id serial unique
		constraint uczestnik_funkcja_pk
			primary key,
	nazwa varchar not null
);

create table uczestnik
(
	czlonek_id int not null
		constraint uczestnik_czlonek_czlonek_id_fk
			references czlonek
				on update cascade on delete set null,
	wydarzenie_id int not null
		constraint uczestnik_wydarzenie_wydarzenie_id_fk
			references wydarzenie
				on update cascade on delete set null,
	funkcja int not null
        references uczestnik_funkcja (uczestnik_funkcja_id)
            on update cascade on delete set null,
	constraint uczestnik_pk
		primary key (czlonek_id, wydarzenie_id)
);

create schema auth;
create table auth.user
(
    username varchar not null primary key,
    password varchar not null
);




------------------------------------------------
-------------------- Widoki --------------------
------------------------------------------------






-- zawiera wypożyczenia które nie zostały jeszcze oddane
create view aktualne_wypozyczenia as
    select * from wypozyczenie where data_do is null;

-- zawiera informacje ile poszczegolni członkowie mają wypożyczonych zasobów i ile z nich dłużej niż 2 tygodnie
create view wypozyczenia_czlonkow as
    with przekroczone as
    (
        select czlonek_id, count(*) as przetrzymane
        from wypozyczenie
        where data_do is null
        and data_od < (current_date - '14 days'::interval)
        group by czlonek_id
    )
    select czlonek_id, count(*) as wypozyczonych, przetrzymane from aktualne_wypozyczenia left join przekroczone using(czlonek_id) group by czlonek_id, przetrzymane;

-- zawiera zasoby które nie są aktualnie wypożyczone przez nikogo
create view dostepne_zasoby as
    select * from zasob where zasob.zasob_id not in (select aw.zasob_id from aktualne_wypozyczenia aw);

-- zawiera informacje o aktualnym statusie każdego członka
create view aktualny_status as
    select czlonek_id, status from status_czlonka where data_do is null group by czlonek_id, status;

-- zawiera informacje o aktualnym zarządzie
create view aktualny_zarzad as
    select czlonek_id, pozycja, data_od from (select zarzad_id, data_od from zarzad where data_do is null) zarz join czlonek_zarzadu using(zarzad_id);

-- podaje na ilu spoktaniach członek nie zapłacił składki, jeżeli posiadał w tym czasie status cżłonka zwyczajnego (tylko członkowie zwyczajni płacą skłądkę)
create view liczba_ominietych_skladek as
with brak_skladki_czlonka_zwyczajnego_na_spotkaniu as
    (
        select * from
        (
            select * from
            (
               select * from obecnosc where oplacono_skladke=false
            ) brak_skladki
            join spotkanie using(spotkanie_id)
        ) brak_skladki_data
        join status_czlonka using(czlonek_id)
            where brak_skladki_data.data>=status_czlonka.data_od
             and (brak_skladki_data.data<=status_czlonka.data_do or status_czlonka.data_do is null)
                and status_czlonka.status=3
    )
select count(*) as ominietych_skladek, czlonek_id from brak_skladki_czlonka_zwyczajnego_na_spotkaniu group by czlonek_id;

-- zawiera informację o członkach którzy przetrzymujących zasoby
create view czlonek_przetrzymuje_zasob as
select czlonek_id, imie, nazwisko, nazwa_zasobu, nazwa as typ_zasobu, data_od from (
   select czlonek_id, nazwa_zasobu, typ_zasobu.nazwa, data_od from
    (
       select czlonek_id, nazwa as nazwa_zasobu, typ_zasobu_id, data_od from
        (
            select * from wypozyczenie where data_do is null and data_od < (current_date - '14 days'::interval)
        ) zcdd join zasob using (zasob_id)
    ) cntd join typ_zasobu using(typ_zasobu_id)
) cntd join czlonek using (czlonek_id);




------------------------------------------------
-------- Triggery i funkcje składowane ---------
------------------------------------------------






-- pilnuje, żeby dana funkcja w konkretnym zarządzie nie była pełniona przez kilku członków
create or replace function check_repetitions_zarzad() returns trigger as
    $$
        begin
            if exists(select * from czlonek_zarzadu where zarzad_id=new.zarzad_id and pozycja=new.pozycja) then
                raise exception 'W zarządzie nie może być dwóch członków pełniących tą samą funkcję';
            else
                return new;
            end if;
        end;
    $$
language plpgsql;

create trigger check_repetitions_zarzad_trigger before insert on czlonek_zarzadu
    for each row execute procedure check_repetitions_zarzad();

-- nadawanie statusu przy dodawaniu nowego członka
create or replace function add_member_status() returns trigger as
    $$
        begin
            insert into status_czlonka values (default, current_date, null, new.czlonek_id, 1);
            return null;
        end;
    $$
language plpgsql;

create trigger add_member_status_trigger after insert on czlonek
    for each row execute procedure add_member_status();

-- automatyczne uzupełnianie daty końca poprzedniego okresu statusu przy dodawaniu nowego i zabezpieczenie przed dodaniem złej daty
create or replace function check_status_ended() returns trigger as
    $$
        declare
            aktualna_data_od date = (select data_od from status_czlonka where new.czlonek_id=status_czlonka.czlonek_id and data_do is null);
            aktualny_status_czlonka_id int = (select status_czlonka_id from status_czlonka where new.czlonek_id=status_czlonka.czlonek_id and data_do is null);
        begin
            if new.data_do is not null then
                raise exception 'Pole data_do powinno zawierać wartość null. Pole data_do jest uzupełniane automatycznie przy dodawaniu nowego rekordu (data_do starego jest taka jak data_do nowego okresu statusu)';
            end if;
            if exists(select * from status_czlonka where new.czlonek_id=status_czlonka.czlonek_id and data_do is null) then
                if new.data_od < aktualna_data_od then
                    raise exception 'Nie można dodać nowego okresu statusu członka. Data początku nowego okresu nie może być starsza niż data początku aktualnego okresu.';
                else
                    update status_czlonka set data_do=new.data_od where status_czlonka.status_czlonka_id=aktualny_status_czlonka_id;
                end if;
            end if;
            return new;
        end;
    $$
language plpgsql;

create trigger check_status_ended_trigger before insert on status_czlonka
    for each row execute procedure check_status_ended();

-- sprawdzanie, czy nowy zarząd nie rozpoczyna kadencji przed kadencją poprzedniego zarządu
create or replace function check_board_ended() returns trigger as
    $$
        declare
            aktualna_data_od date = (select data_od from zarzad where data_do is null);
            aktualny_zarzad_id int = (select zarzad_id from zarzad where data_do is null);
        begin
            if new.data_do is not null then
                raise exception 'Pole data_do powinno zawierać wartość null. Pole data_do jest uzupełniane automatycznie przy dodawaniu nowego rekordu (data_do starego jest taka jak data_do nowego okresu urzędowania zarządu)';
            end if;
            if exists(select * from zarzad where data_do is null) then
                if new.data_od < aktualna_data_od then
                    raise exception 'Nie można dodać nowego zarządu, który urzęduje wcześniej niż aktualny.';
                else
                    update zarzad set data_do=new.data_od where zarzad.zarzad_id=aktualny_zarzad_id;
                end if;
            end if;
            return new;
        end;
    $$
language plpgsql;

create trigger check_board_ended_trigger before insert on zarzad
    for each row execute procedure check_board_ended();

-- pilnuje, żeby członkowie nie wypożyczali więcej niż 3 zasoby
create or replace function watch_max_borrowed() returns trigger as
    $$
        begin
            if (select wypozyczonych from wypozyczenia_czlonkow where czlonek_id=new.czlonek_id) >= 3 then
                raise exception 'Nie można wypożyczyć więcej niż 3 zasoby';
            end if;
            return new;
        end;
    $$
language plpgsql;

create trigger watch_max_borrowed_trigger before insert on wypozyczenie
    for each row execute procedure watch_max_borrowed();

-- pilnuje, żeby nie można było wypożyczyć gry która jest akutalnie wypożyczona przez kogoś innego
create or replace function check_resource_availability() returns trigger as
    $$
        begin
            if new.zasob_id not in (select zasob_id from zasob) then
                raise exception 'Nie ma zasobu o takim id';
            elsif new.zasob_id in (select zasob_id from dostepne_zasoby) then
                return new;
            end if;
                raise exception 'Ten zasób jest obecnie wypożyczony przez kogoś innego';
        end;
    $$
language plpgsql;

create trigger check_resource_availability_trigger before insert on wypozyczenie
    for each row execute procedure check_resource_availability();

-- pilnuje, żeby osoba wypożyczająca grę miała odpowiedni status
create or replace function check_status_before_borrow() returns trigger as
    $$
        begin
            if (select status from aktualny_status where czlonek_id=new.czlonek_id) = 3 then
                return new;
            else
               raise exception 'Wypożyczać zaosby mogą jedynie członkowie zwyczajni';
            end if;
        end;
    $$
language plpgsql;

create trigger check_status_before_borrow_trigger before insert on wypozyczenie
    for each row execute procedure check_status_before_borrow();

-- pilnuje, żeby osoba wypożyczająca nie miała przetrzymanych innych zasobów
create or replace function watch_held_borrowed() returns trigger as
    $$
        begin
            if (select przetrzymane from wypozyczenia_czlonkow where czlonek_id=new.czlonek_id) > 0 then
                raise exception 'Posiada przetrzymane zasoby. Osoba która nie odda zasobu w ciągu 2 tygodni nie może wypożyczać nowych';
            end if;
                return new;
        end;
    $$
language plpgsql;

create trigger watch_held_borrowed_trigger before insert on wypozyczenie
    for each row execute procedure watch_held_borrowed();

-- pilnuje, żeby data_do była większa niż data_od
create or replace function watch_date_order() returns trigger as
    $$
        begin
            if new.data_od > new.data_do then
                raise exception 'data_od powinna mieć większą wartość, niż data_do';
            end if;
            return new;
        end;
    $$
language plpgsql;

create trigger watch_date_order_wypozyczenie_trigger before insert on wypozyczenie
    for each row execute procedure watch_date_order();

create trigger watch_date_order_wydarzenie_trigger before insert on wydarzenie
    for each row execute procedure watch_date_order();

-- ostrzega że degradowany członek zwyczajny ma wypożyczone zasoby (ponieważ wypożyczać mogą tylko członkowie zwyczajni) oraz że jest w zarządzie
create or replace function check_on_demotion() returns trigger as
    $$
        begin
            if new.status != 3 then
                if (select wypozyczonych from wypozyczenia_czlonkow where wypozyczenia_czlonkow.czlonek_id=new.czlonek_id) > 0 then
                    raise warning 'Członek ma jeszcze wypożyczone zasoby (tylko członkowie zwyczajni mogą wypożyczac zasoby)';
                end if;
                if new.czlonek_id in (select czlonek_id from aktualny_zarzad) then
                    raise warning 'Członek jest w aktualnym zarządzie (tylko członkowie zwyczajni mogą być w zarządzie)';
                end if;
            end if;
            return new;
        end;
    $$
language plpgsql;

create trigger check_on_demotion_trigger before insert on status_czlonka
    for each row execute procedure check_on_demotion();

-- pilnuje, żeby do zarządu mogli zostać dodani jedynie członkowie zwyczajni, którzy nie mają dlugów i nie przetrzumują żadnych zasobów
create or replace function check_member_fits_board_prerequisites() returns trigger as
    $$
        begin
            if (select status from aktualny_status where aktualny_status.czlonek_id=new.czlonek_id) != 3 then
                raise exception 'Członek nie jest członkiem zwyczajnym. Tylko członkowie zwyczajni mogą należeć do zarządu.';
            elsif (select przetrzymane from wypozyczenia_czlonkow where czlonek_id=new.czlonek_id) > 0 then
                raise exception 'Członek ma przetrzymane zasoby.';
            elsif (select ominietych_skladek from liczba_ominietych_skladek where liczba_ominietych_skladek.czlonek_id=new.czlonek_id) > 0 then
                raise exception 'Członek ma zaległe składki do zapłaty. Cłonkowie zarządu nie mogą mieć dlugów.';
            end if;
            return new;
        end;
    $$
language plpgsql;

create trigger check_member_fits_board_prerequisites_trigger before insert on czlonek_zarzadu
    for each row execute procedure check_member_fits_board_prerequisites();

-- ostrzega przy spotkaniu, że członek zalega z zapłatą
create or replace function check_payment() returns trigger as
    $$
        declare
            r liczba_ominietych_skladek%rowtype;
        begin
            for r in (select * from liczba_ominietych_skladek) loop
                if r.ominietych_skladek > 4 then
                    raise warning 'Członek o id % (% %) ma długi - do tej pory ominął % składek.', r.czlonek_id, (select imie from czlonek where czlonek_id=r.czlonek_id), (select nazwisko from czlonek where czlonek_id=r.czlonek_id), r.ominietych_skladek;
                end if;
            end loop;
            return new;
        end;
    $$
language plpgsql;

create trigger check_payment_trigger before insert on spotkanie
    for each row execute procedure check_payment();

-- dopilnowanie, żeby nie usunięto zasobu, który jest u kogoś na wypożyczeniu, oraz zadbanie o spójność tabeli wypozyczenie
create or replace function watch_delete_zasob() returns trigger as
    $$
        begin
            if old.zasob_id in (select zasob_id from dostepne_zasoby) then
                delete from wypozyczenie where wypozyczenie.zasob_id=old.zasob_id;
                return old;
            else
                raise exception 'Nie można usunąć zasobu, który jest u kogoś na wypożyczeniu';
            end if;
        end;
    $$
language plpgsql;

create trigger watch_delete_zasob_trigger before delete on zasob
    for each row execute procedure watch_delete_zasob();

-- dopilnowanie, żeby nie usunięto typu zasobu, jeżeli istnieje jeszcze zasób, który go posiada
create or replace function watch_delete_typ_zasobu() returns trigger as
    $$
        begin
            if old.typ_zasobu_id in (select distinct zasob.typ_zasobu_id from zasob) then
                raise exception 'Nie można usunąć typu zasobu, jeżeli istnieją jeszcze zasoby o tym typie zasobu';
            end if;
            return old;
        end;
    $$
language plpgsql;

create trigger watch_delete_typ_zasobu_trigger before delete on typ_zasobu
    for each row execute procedure watch_delete_typ_zasobu();

-- przy usuwaniu wydarzenia usuwa odpowiednie rekordy z tabeli uczestnik
create or replace function watch_delete_wydarzenie() returns trigger as
    $$
        begin
            delete from uczestnik where wydarzenie_id=old.wydarzenie_id;
            return old;
        end;
    $$
language plpgsql;

create trigger watch_delete_wydarzenie_trigger before delete on wydarzenie
    for each row execute procedure watch_delete_wydarzenie();

-- pilnuje daty przy aktualizowaniu tabeli wypożyczeń
create or replace function watch_date_on_update_wypozyczenia() returns trigger as
    $$
        begin
            if new.data_do < old.data_od then
                raise exception 'Data zakończenia wypożyczenia powinna być większa od daty jego rozpoczęcia';
            end if;
            return new;
        end;
    $$
language plpgsql;

create trigger watch_date_on_update_wypozyczenia_trigger before update on wypozyczenie
    for each row execute procedure watch_date_on_update_wypozyczenia();





------------------------------------------------
------------------- Inserty --------------------
------------------------------------------------






-- status nazwa
insert into status_nazwa values (default, 'Członek obserwator');
insert into status_nazwa values (default, 'Członek');
insert into status_nazwa values (default, 'Członek zwyczajny');
insert into status_nazwa values (default, 'Nieaktywny członek');

-- pozycja w zarządzie
insert into pozycja_w_zarzadzie values (default, 'Prezes');
insert into pozycja_w_zarzadzie values (default, 'Skarbnik');
insert into pozycja_w_zarzadzie values (default, 'Sekretarz');

-- uczestnik funkcja
insert into uczestnik_funkcja values (default, 'Organizator');
insert into uczestnik_funkcja values (default, 'Prelegent');
insert into uczestnik_funkcja values (default, 'Uczestnik');

-- członek
insert into czlonek values (default, 'Konrad', 'Walas');
insert into czlonek values (default, 'Ryszard', 'Werner');
insert into czlonek values (default, 'Karolina', 'Libucha');
insert into czlonek values (default, 'Teresa', 'Kosiba');
insert into czlonek values (default, 'Marcin', 'Górecki');
insert into czlonek values (default, 'Oliwer', 'Andrzejewski');
insert into czlonek values (default, 'Filip', 'Lis');
insert into czlonek values (default, 'Alek', 'Sokołowski');
insert into czlonek values (default, 'Adrianna', 'Oleska');

-- zarząd
insert into zarzad values (default, '2019-07-30', null);
insert into zarzad values (default, '2020-06-07');

-- status członka
update status_czlonka set data_od='2015-03-14', data_do=null where czlonek_id=1 and status=1;
insert into status_czlonka values (default, '2015-07-04', null, 1, 2);
insert into status_czlonka values (default, '2017-02-14', null, 1, 3);

update status_czlonka set data_od='2015-03-14', data_do=null where czlonek_id=2 and status=1;
insert into status_czlonka values (default, '2015-07-04', null, 2, 2);
insert into status_czlonka values (default, '2017-02-14', null, 2, 3);

update status_czlonka set data_od='2015-03-14', data_do=null where czlonek_id=3 and status=1;
insert into status_czlonka values (default, '2015-07-04', null, 3, 2);
insert into status_czlonka values (default, '2017-02-14', null, 3, 3);

update status_czlonka set data_od='2015-03-14', data_do=null where czlonek_id=4 and status=1;
insert into status_czlonka values (default, '2015-07-04', null, 4, 2);
insert into status_czlonka values (default, '2017-02-14', null, 4, 3);

update status_czlonka set data_od='2015-03-14', data_do=null where czlonek_id=5 and status=1;
insert into status_czlonka values (default, '2015-07-04', null, 5, 2);
insert into status_czlonka values (default, '2017-02-14', null, 5, 3);

update status_czlonka set data_od='2015-03-14', data_do=null where czlonek_id=6 and status=1;
insert into status_czlonka values (default, '2015-07-04', null, 6, 2);
insert into status_czlonka values (default, '2017-02-14', null, 6, 3);

update status_czlonka set data_od='2015-03-14', data_do=null where czlonek_id=8 and status=1;
insert into status_czlonka values (default, '2015-07-04', null, 8, 2);
insert into status_czlonka values (default, '2017-02-14', null, 8, 3);
insert into status_czlonka values (default, '2018-8-2', null, 8, 2);

update status_czlonka set data_od='2016-03-14', data_do=null where czlonek_id=9 and status=1;
insert into status_czlonka values (default, '2017-07-04', null, 9, 2);
insert into status_czlonka values (default, '2019-02-14', null, 9, 3);

-- członek zarządu
insert into czlonek_zarzadu values (1, 1, 1);
insert into czlonek_zarzadu values (1, 2, 2);
insert into czlonek_zarzadu values (1, 3, 3);
insert into czlonek_zarzadu values (2, 4, 1);
insert into czlonek_zarzadu values (2, 5, 2);
insert into czlonek_zarzadu values (2, 6, 3);

-- cotygodniowe spotkanie
insert into spotkanie values (default, '2020-11-7');
insert into spotkanie values (default, '2020-11-14');
insert into spotkanie values (default, '2017-08-20');

-- obecność na cotygodniowym spotkaniu
insert into obecnosc values (1, 1, true);
insert into obecnosc values (2, 1, true);
insert into obecnosc values (3, 1, true);
insert into obecnosc values (4, 1, true);
insert into obecnosc values (5, 1, true);
insert into obecnosc values (6, 1, true);
insert into obecnosc values (7, 1, false);
insert into obecnosc values (8, 1, false);
insert into obecnosc values (9, 1, false);

insert into obecnosc values (1, 2, true);
insert into obecnosc values (2, 2, false);
insert into obecnosc values (3, 2, true);
insert into obecnosc values (4, 2, true);
insert into obecnosc values (9, 2, false);

insert into obecnosc values (8, 3, false);

-- typ zasobu
insert into typ_zasobu values (default, 'Gra planszowa', 'Gra która ma planszę.');
insert into typ_zasobu values (default, 'Gra karciana', 'Gra w którą gra się kartami.');
insert into typ_zasobu values (default, 'Podręcznik do gry RPG', 'Opisane są tam zasady.');

-- zasób
insert into zasob values (default, 1, 'Chaos w starym świecie', 'Galakta');
insert into zasob values (default, 1, 'Relic - tajemnica sektora Antra', 'Galakta');
insert into zasob values (default, 2, 'MTG M14 event deck theros', 'Wizards of the coast');
insert into zasob values (default, 3, 'Pathfinder core rulebook', 'Paizo inc.');
insert into zasob values (default, 1, 'Awanturnicy', 'Dust Game');
insert into zasob values (default, 2, 'Folwark', 'Valkiria.net');
insert into zasob values (default, 3, 'Warhammer', 'Games Workshop');
insert into zasob values (default, 2, 'Łowcy smoków', 'Bard centrum gier');

-- wypożyczenie zasobu
insert into wypozyczenie values (1, 6, '2020-12-26', now());
insert into wypozyczenie values (2, 6, '2020-12-01', null);
insert into wypozyczenie values (4, 4, '2020-12-01', now());
insert into wypozyczenie values (5, 3, '2021-01-01', null);

-- wydarzenie
insert into wydarzenie values (default, 'Fantastyczne ferie', 'Wiedźmin', '2020-2-1', '2020-2-2');

-- uczestnik
insert into uczestnik values (1, 1, 1);
insert into uczestnik values (2, 1, 2);
insert into uczestnik values (5, 1, 3);
insert into uczestnik values (6, 1, 3);
insert into uczestnik values (8, 1, 3);

-- do autoryzacji w aplikacji
insert into auth.user values ('admin', 'admin');
insert into auth.user values ('123', '123');