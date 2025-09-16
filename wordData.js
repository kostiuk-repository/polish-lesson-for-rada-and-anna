// Comprehensive Polish-Russian Dictionary for the Cafe Dialog Lesson
const wordData = {
    // NOUNS (Rzeczowniki)
    'Dzień': { 
        type: 'noun', 
        gender: 'm', 
        translation: 'день', 
        pronunciation: '(джень)', 
        pronunciation_rule: 'Буква "ń" или сочетание "ni" дают мягкий звук "нь".', 
        etymology: 'Происходит от праславянского *dьnь. Родственно русскому "день".',
        cases: { 
            'Mianownik (И.п.)': 'dzień', 
            'Dopełniacz (Р.п.)': 'dnia', 
            'Celownik (Д.п.)': 'dniowi', 
            'Biernik (В.п.)': 'dzień', 
            'Narzędnik (Т.п.)': 'dniem', 
            'Miejscownik (П.п.)': 'dniu' 
        },
        examples: [
            { polish: 'Miłego dnia!', russian: 'Хорошего дня!' },
            { polish: 'Cały dzień pada deszcz.', russian: 'Весь день идет дождь.' }
        ],
        related: ['dobry', 'wieczór', 'rano', 'noc']
    },
    'rezerwację': { 
        type: 'noun', 
        gender: 'f', 
        translation: 'бронь (винительный падеж)', 
        pronunciation: '(ре-зер-ВА-цье)', 
        pronunciation_rule: 'Носовая "ę" читается как "е" с носовым призвуком.',
        base_form: 'rezerwacja',
        etymology: 'От французского "réservation" через немецкий.',
        cases: { 
            'Mianownik (И.п.)': 'rezerwacja', 
            'Dopełniacz (Р.п.)': 'rezerwacji', 
            'Celownik (Д.п.)': 'rezerwacji', 
            'Biernik (В.п.)': 'rezerwację', 
            'Narzędnik (Т.п.)': 'rezerwacją', 
            'Miejscownik (П.п.)': 'rezerwacji' 
        },
        examples: [
            { polish: 'Mam rezerwację na godzinę ósmą.', russian: 'У меня бронь на восемь часов.' },
            { polish: 'Czy mogę anulować rezerwację?', russian: 'Могу ли я отменить бронь?' }
        ],
        related: ['stolik', 'zamawiać', 'hotel']
    },
    'rezerwacji': { 
        type: 'noun', 
        redirect: 'rezerwację',
        case_form: 'Dopełniacz'
    },
    'stolik': { 
        type: 'noun', 
        gender: 'm', 
        translation: 'столик', 
        pronunciation: '(СТО-лик)', 
        etymology: 'Уменьшительная форма от "stół" (стол).',
        cases: { 
            'Mianownik (И.п.)': 'stolik', 
            'Dopełniacz (Р.п.)': 'stolika', 
            'Celownik (Д.п.)': 'stolikowi', 
            'Biernik (В.п.)': 'stolik', 
            'Narzędnik (Т.п.)': 'stolikiem', 
            'Miejscownik (П.п.)': 'stoliku' 
        },
        examples: [
            { polish: 'Stolik przy oknie jest wolny.', russian: 'Столик у окна свободен.' },
            { polish: 'Zarezerwowaliśmy stolik dla czterech osób.', russian: 'Мы забронировали столик на четыре персоны.' }
        ],
        related: ['krzesło', 'restauracja', 'rezerwacja', 'okno']
    },
    'menu': { 
        type: 'noun', 
        gender: 'n', 
        translation: 'меню', 
        pronunciation: '(МЕ-ню)', 
        info: 'Неизменяемое существительное, заимствованное из французского.',
        etymology: 'От французского "menu", буквально "маленький, детальный".',
        examples: [
            { polish: 'Czy mogę prosić o menu?', russian: 'Могу ли я попросить меню?' },
            { polish: 'W menu jest dużo wegetariańskich opcji.', russian: 'В меню много вегетарианских вариантов.' }
        ],
        related: ['karta', 'zamówienie', 'danie', 'kelner']
    },
    'wodę': { 
        type: 'noun', 
        redirect: 'woda',
        case_form: 'Biernik'
    },
    'woda': { 
        type: 'noun', 
        gender: 'f', 
        translation: 'вода', 
        pronunciation: '(ВО-да)', 
        etymology: 'Происходит от праславянского *voda, родственно русскому "вода".',
        cases: { 
            'Mianownik (И.п.)': 'woda', 
            'Dopełniacz (Р.п.)': 'wody', 
            'Celownik (Д.п.)': 'wodzie', 
            'Biernik (В.п.)': 'wodę', 
            'Narzędnik (Т.п.)': 'wodą', 
            'Miejscownik (П.п.)': 'wodzie' 
        },
        examples: [
            { polish: 'Woda z cytryną, proszę.', russian: 'Воду с лимоном, пожалуйста.' },
            { polish: 'Ta woda jest bardzo zimna.', russian: 'Эта вода очень холодная.' }
        ],
        related: ['cytryna', 'napój', 'szklanka', 'butelka']
    },
    'zamówienia': { 
        type: 'noun', 
        gender: 'n', 
        translation: 'заказа (родительный падеж)', 
        pronunciation: '(за-му-ВЕ-ня)', 
        pronunciation_rule: 'Сочетание "ni" дает мягкий звук "нь".', 
        base_form: 'zamówienie',
        etymology: 'От глагола "zamówić" (заказать).',
        cases: { 
            'Mianownik (И.п.)': 'zamówienie', 
            'Dopełniacz (Р.п.)': 'zamówienia', 
            'Celownik (Д.п.)': 'zamówieniu', 
            'Biernik (В.п.)': 'zamówienie', 
            'Narzędnik (Т.п.)': 'zamówieniem', 
            'Miejscownik (П.п.)': 'zamówieniu' 
        },
        examples: [
            { polish: 'Złożenie zamówienia zajmuje minutę.', russian: 'Оформление заказа занимает минуту.' },
            { polish: 'Czy mogę zmienić zamówienie?', russian: 'Могу ли я изменить заказ?' }
        ],
        related: ['zamawiać', 'kelner', 'restauracja', 'danie']
    },
    'sałatkę': { 
        type: 'noun', 
        redirect: 'sałatka',
        case_form: 'Biernik'
    },
    'sałatka': { 
        type: 'noun', 
        gender: 'f', 
        translation: 'салат', 
        pronunciation: '(са-ВАТ-ка)', 
        etymology: 'От итальянского "salata", от латинского "sal" (соль).',
        cases: { 
            'Mianownik (И.п.)': 'sałatka', 
            'Dopełniacz (Р.п.)': 'sałatki', 
            'Celownik (Д.п.)': 'sałatce', 
            'Biernik (В.п.)': 'sałatkę', 
            'Narzędnik (Т.п.)': 'sałatką', 
            'Miejscownik (П.п.)': 'sałatce' 
        },
        examples: [
            { polish: 'Sałatka grecka jest bardzo smaczna.', russian: 'Греческий салат очень вкусный.' },
            { polish: 'Czy w sałatce są orzechy?', russian: 'Есть ли в салате орехи?' }
        ],
        related: ['warzywa', 'sos', 'kurczak', 'zdrowie']
    },
    'rachunek': { 
        type: 'noun', 
        gender: 'm', 
        translation: 'счет', 
        pronunciation: '(ра-ХУ-нэк)', 
        pronunciation_rule: 'Сочетание "ch" читается как русский звук "х".', 
        etymology: 'От немецкого "Rechnung".',
        cases: { 
            'Mianownik (И.п.)': 'rachunek', 
            'Dopełniacz (Р.п.)': 'rachunku', 
            'Celownik (Д.п.)': 'rachunkowi', 
            'Biernik (В.п.)': 'rachunek', 
            'Narzędnik (Т.п.)': 'rachunkiem', 
            'Miejscownik (П.п.)': 'rachunku' 
        },
        examples: [
            { polish: 'Poproszę rachunek.', russian: 'Счет, пожалуйста.' },
            { polish: 'Rachunek wynosi 150 złotych.', russian: 'Счет составляет 150 злотых.' }
        ],
        related: ['pieniądze', 'zapłata', 'koszt', 'restauracja']
    },
    'alergię': { 
        type: 'noun', 
        redirect: 'alergia',
        case_form: 'Biernik'
    },
    'alergia': { 
        type: 'noun', 
        gender: 'f', 
        translation: 'аллергия', 
        pronunciation: '(а-ЛЕР-гья)', 
        etymology: 'От греческого "allos" (другой) + "ergon" (действие).',
        cases: { 
            'Mianownik (И.п.)': 'alergia', 
            'Dopełniacz (Р.п.)': 'alergii', 
            'Celownik (Д.п.)': 'alergii', 
            'Biernik (В.п.)': 'alergię', 
            'Narzędnik (Т.п.)': 'alergią', 
            'Miejscownik (П.п.)': 'alergii' 
        },
        examples: [
            { polish: 'Mam alergię na orzechy.', russian: 'У меня аллергия на орехи.' },
            { polish: 'Czy to danie zawiera alergeny?', russian: 'Содержит ли это блюдо аллергены?' }
        ],
        related: ['orzechy', 'leki', 'reakcja', 'zdrowie']
    },
    'makaron': { 
        type: 'noun', 
        gender: 'm', 
        translation: 'макароны, паста', 
        pronunciation: '(ма-КА-рон)', 
        etymology: 'От итальянского "maccherone".',
        cases: { 
            'Mianownik (И.п.)': 'makaron', 
            'Dopełniacz (Р.п.)': 'makaronu', 
            'Celownik (Д.п.)': 'makaronowi', 
            'Biernik (В.п.)': 'makaron', 
            'Narzędnik (Т.п.)': 'makaronem', 
            'Miejscownik (П.п.)': 'makaronie' 
        },
        examples: [
            { polish: 'Makaron z sosem pomidorowym.', russian: 'Макароны с томатным соусом.' },
            { polish: 'Uwielbiam makaron carbonara.', russian: 'Обожаю пасту карбонара.' }
        ],
        related: ['sos', 'warzywa', 'włoska kuchnia', 'obiad']
    },
    'cukinię': { 
        type: 'noun', 
        redirect: 'cukinia',
        case_form: 'Biernik'
    },
    'cukinia': { 
        type: 'noun', 
        gender: 'f', 
        translation: 'кабачок', 
        pronunciation: '(цу-КИ-ня)', 
        etymology: 'От итальянского "zucchina", уменьшительная форма от "zucca" (тыква).',
        cases: { 
            'Mianownik (И.п.)': 'cukinia', 
            'Dopełniacz (Р.п.)': 'cukinii', 
            'Celownik (Д.п.)': 'cukinii', 
            'Biernik (В.п.)': 'cukinię', 
            'Narzędnik (Т.п.)': 'cukinią', 
            'Miejscownik (П.п.)': 'cukinii' 
        },
        examples: [
            { polish: 'Cukinia jest bardzo zdrowa.', russian: 'Кабачок очень полезен.' },
            { polish: 'Dodaj cukinię do zupy.', russian: 'Добавь кабачок в суп.' }
        ],
        related: ['warzywa', 'zdrowie', 'gotowanie', 'ogród']
    },
    'deser': { 
        type: 'noun', 
        gender: 'm', 
        translation: 'десерт', 
        pronunciation: '(ДЕ-сер)', 
        etymology: 'От французского "dessert".',
        cases: { 
            'Mianownik (И.п.)': 'deser', 
            'Dopełniacz (Р.п.)': 'deseru', 
            'Celownik (Д.п.)': 'deserowi', 
            'Biernik (В.п.)': 'deser', 
            'Narzędnik (Т.п.)': 'deserem', 
            'Miejscownik (П.п.)': 'deserze' 
        },
        examples: [
            { polish: 'Na deser mam czekoladowy tort.', russian: 'На десерт у меня шоколадный торт.' },
            { polish: 'Jaki deser Pani poleca?', russian: 'Какой десерт вы рекомендуете?' }
        ],
        related: ['tort', 'słodycze', 'kawa', 'restauracja']
    },
    'deser dnia': { 
        type: 'phrase', 
        translation: 'десерт дня', 
        pronunciation: '(ДЕ-сер ДНЯ)', 
        examples: [
            { polish: 'Dzisiejszy deser dnia to tiramisu.', russian: 'Сегодняшний десерт дня - тирамису.' },
            { polish: 'Czy mogę zamówić deser dnia?', russian: 'Могу ли я заказать десерт дня?' }
        ],
        related: ['deser', 'dzień', 'specjalność', 'menu']
    },
    'sernik': { 
        type: 'noun', 
        gender: 'm', 
        translation: 'чизкейк, творожник', 
        pronunciation: '(СЕР-ник)', 
        etymology: 'От "ser" (сыр, творог) + суффикс "-nik".',
        cases: { 
            'Mianownik (И.п.)': 'sernik', 
            'Dopełniacz (Р.п.)': 'sernika', 
            'Celownik (Д.п.)': 'sernikowi', 
            'Biernik (В.п.)': 'sernik', 
            'Narzędnik (Т.п.)': 'sernikiem', 
            'Miejscownik (П.п.)': 'serniku' 
        },
        examples: [
            { polish: 'Sernik z malinami to moja ulubiona słodycz.', russian: 'Чизкейк с малиной - моя любимая сладость.' },
            { polish: 'Babcia robi najlepszy sernik.', russian: 'Бабушка делает лучший творожник.' }
        ],
        related: ['ser', 'deser', 'tort', 'słodycze']
    },
    'napiwek': { 
        type: 'noun', 
        gender: 'm', 
        translation: 'чаевые', 
        pronunciation: '(на-ПИ-век)', 
        etymology: 'От "na" (на) + "pić" (пить) + суффикс "-ek", буквально "на выпивку".',
        cases: { 
            'Mianownik (И.п.)': 'napiwek', 
            'Dopełniacz (Р.п.)': 'napiwku', 
            'Celownik (Д.п.)': 'napiwkowi', 
            'Biernik (В.п.)': 'napiwek', 
            'Narzędnik (Т.п.)': 'napiwkiem', 
            'Miejscownik (П.п.)': 'napiwku' 
        },
        examples: [
            { polish: 'Zostaw kelnerowi napiwek.', russian: 'Оставь официанту чаевые.' },
            { polish: 'W Polsce napiwek to około 10%.', russian: 'В Польше чаевые составляют около 10%.' }
        ],
        related: ['kelner', 'pieniądze', 'obsługa', 'restauracja']
    },

    // VERBS (Czasowniki)
    'witać': { 
        type: 'verb', 
        translation: 'приветствовать', 
        pronunciation: '(ВИ-тачь)', 
        pronunciation_rule: 'Буква "ć" - это мягкий звук, похожий на "чь".', 
        etymology: 'Происходит от праславянского *vitati.',
        aspect: 'niedokonany',
        conjugation_table: { 
            present: { 
                ja: 'witam', 
                ty: 'witasz', 
                'on/ona/ono': 'wita', 
                my: 'witamy', 
                wy: 'witacie', 
                'oni/one': 'witają' 
            },
            past: {
                'on (m)': 'witał',
                'ona (f)': 'witała',
                'ono (n)': 'witało',
                'oni (m)': 'witali',
                'one (f)': 'witały'
            }
        },
        examples: [
            { polish: 'Witam serdecznie!', russian: 'Сердечно приветствую!' },
            { polish: 'Witamy nowych studentów.', russian: 'Приветствуем новых студентов.' }
        ],
        related: ['powitanie', 'cześć', 'dzień dobry']
    },
    'wrócić': { 
        type: 'verb', 
        translation: 'вернуться', 
        pronunciation: '(ВРУТ-цичь)', 
        pronunciation_rule: 'Сочетание "ó" читается как "у".', 
        etymology: 'От праславянского *vъrtiti.',
        aspect: 'dokonany',
        conjugation_table: { 
            future: { 
                ja: 'wrócę', 
                ty: 'wrócisz', 
                'on/ona/ono': 'wróci', 
                my: 'wrócimy', 
                wy: 'wrócicie', 
                'oni/one': 'wrócą' 
            },
            past: {
                'on (m)': 'wrócił',
                'ona (f)': 'wróciła',
                'ono (n)': 'wróciło',
                'oni (m)': 'wrócili',
                'one (f)': 'wróciły'
            }
        },
        examples: [
            { polish: 'Wrócę za chwilę.', russian: 'Вернусь через минутку.' },
            { polish: 'Kiedy wrócisz do domu?', russian: 'Когда ты вернешься домой?' }
        ],
        related: ['powrót', 'iść', 'dom']
    },
    'przyjąć': { 
        type: 'verb', 
        translation: 'принять', 
        pronunciation: '(ПШЫ-йончь)', 
        pronunciation_rule: 'Сочетание "rz" после согласной читается как "ж". Носовая "ą" = "он".', 
        etymology: 'От "przy-" (при-) + "jąć" (взять).',
        aspect: 'dokonany',
        conjugation_table: { 
            future: { 
                ja: 'przyjmę', 
                ty: 'przyjmiesz', 
                'on/ona/ono': 'przyjmie', 
                my: 'przyjmiemy', 
                wy: 'przyjmiecie', 
                'oni/one': 'przyjmą' 
            },
            past: {
                'on (m)': 'przyjął',
                'ona (f)': 'przyjęła',
                'ono (n)': 'przyjęło',
                'oni (m)': 'przyjęli',
                'one (f)': 'przyjęły'
            }
        },
        examples: [
            { polish: 'Czy mogę przyjąć zamówienie?', russian: 'Могу ли я принять заказ?' },
            { polish: 'Przyjmij moje gratulacje.', russian: 'Прими мои поздравления.' }
        ],
        related: ['brać', 'otrzymywać', 'akceptować']
    },
    'powiedzieć': { 
        type: 'verb', 
        translation: 'сказать', 
        pronunciation: '(по-ВЕ-джечь)', 
        pronunciation_rule: 'Сочетание "dzi" читается как "джь".', 
        etymology: 'От праславянского *povediti.',
        aspect: 'dokonany',
        conjugation_table: { 
            future: { 
                ja: 'powiem', 
                ty: 'powiesz', 
                'on/ona/ono': 'powie', 
                my: 'powiemy', 
                wy: 'powiecie', 
                'oni/one': 'powiedzą' 
            },
            past: {
                'on (m)': 'powiedział',
                'ona (f)': 'powiedziała',
                'ono (n)': 'powiedziało',
                'oni (m)': 'powiedzieli',
                'one (f)': 'powiedziały'
            }
        },
        examples: [
            { polish: 'Proszę powiedzieć prawdę.', russian: 'Пожалуйста, скажите правду.' },
            { polish: 'Co chcesz powiedzieć?', russian: 'Что ты хочешь сказать?' }
        ],
        related: ['mówić', 'rozmawiać', 'słowo']
    },
    'sprawdzić': { 
        type: 'verb', 
        translation: 'проверить', 
        pronunciation: '(СПРА-вджичь)', 
        etymology: 'От "sprawny" (исправный) + суффикс.',
        aspect: 'dokonany',
        conjugation_table: { 
            future: { 
                ja: 'sprawdzę', 
                ty: 'sprawdzisz', 
                'on/ona/ono': 'sprawdzi', 
                my: 'sprawdzimy', 
                wy: 'sprawdzicie', 
                'oni/one': 'sprawdzą' 
            }
        },
        examples: [
            { polish: 'Sprawdzę tę informację.', russian: 'Я проверю эту информацию.' },
            { polish: 'Sprawdź, czy masz klucze.', russian: 'Проверь, есть ли у тебя ключи.' }
        ],
        related: ['kontrola', 'weryfikacja', 'badanie']
    },
    'zaproponować': { 
        type: 'verb', 
        translation: 'предложить', 
        pronunciation: '(за-про-по-НО-вачь)', 
        etymology: 'От латинского "proponere" через немецкий.',
        aspect: 'dokonany',
        conjugation_table: { 
            future: { 
                ja: 'zaproponuję', 
                ty: 'zaproponujesz', 
                'on/ona/ono': 'zaproponuje', 
                my: 'zaproponujemy', 
                wy: 'zaproponujecie', 
                'oni/one': 'zaproponują' 
            }
        },
        examples: [
            { polish: 'Mogę zaproponować inne rozwiązanie.', russian: 'Могу предложить другое решение.' },
            { polish: 'Co nam proponujesz?', russian: 'Что ты нам предлагаешь?' }
        ],
        related: ['propozycja', 'sugerować', 'oferować']
    },
    'dostać': { 
        type: 'verb', 
        translation: 'получить', 
        pronunciation: '(до-СТАчь)', 
        aspect: 'dokonany',
        conjugation_table: { 
            future: { 
                ja: 'dostanę', 
                ty: 'dostaniesz', 
                'on/ona/ono': 'dostanie', 
                my: 'dostaniemy', 
                wy: 'dostaniecie', 
                'oni/one': 'dostaną' 
            }
        },
        examples: [
            { polish: 'Czy mogę dostać stolik?', russian: 'Могу ли я получить столик?' },
            { polish: 'Dostaniesz odpowiedź jutro.', russian: 'Получишь ответ завтра.' }
        ],
        related: ['otrzymać', 'brać', 'mieć']
    },
    'dodać': { 
        type: 'verb', 
        translation: 'добавить', 
        pronunciation: '(до-дачь)', 
        aspect: 'dokonany',
        conjugation_table: { 
            future: { 
                ja: 'dodam', 
                ty: 'dodasz', 
                'on/ona/ono': 'doda', 
                my: 'dodamy', 
                wy: 'dodacie', 
                'oni/one': 'dodadzą' 
            }
        },
        examples: [
            { polish: 'Dodaj sól do zupy.', russian: 'Добавь соль в суп.' },
            { polish: 'Czy można dodać cytrynę?', russian: 'Можно ли добавить лимон?' }
        ],
        related: ['dodatek', 'więcej', 'składnik']
    },
    'przynieść': { 
        type: 'verb', 
        translation: 'принести', 
        pronunciation: '(пши-НЕШЬЧЬ)', 
        pronunciation_rule: 'Сочетание "rz" после "p" = "ш". "ś" = мягкий "шь".', 
        aspect: 'dokonany',
        conjugation_table: { 
            future: { 
                ja: 'przyniosę', 
                ty: 'przyniesiesz', 
                'on/ona/ono': 'przyniesie', 
                my: 'przyniesiemy', 
                wy: 'przyniesiecie', 
                'oni/one': 'przyniosą' 
            }
        },
        examples: [
            { polish: 'Przyniesię ci kawę.', russian: 'Принесу тебе кофе.' },
            { polish: 'Przynieś rachunek, proszę.', russian: 'Принеси счет, пожалуйста.' }
        ],
        related: ['nosić', 'dostarczać', 'kelner']
    },

    // VERB FORMS - References to base verbs
    'witam': { type: 'verb_form', infinitive: 'witać', person: '1sg', tense: 'present' },
    'mają': { type: 'verb_form', infinitive: 'mieć', person: '3pl', tense: 'present' },
    'mamy': { type: 'verb_form', infinitive: 'mieć', person: '1pl', tense: 'present' },
    'Mam': { type: 'verb_form', infinitive: 'mieć', person: '1sg', tense: 'present' },
    'wrócę': { type: 'verb_form', infinitive: 'wrócić', person: '1sg', tense: 'future' },
    'Mogę': { type: 'verb_form', infinitive: 'móc', person: '1sg', tense: 'present' },
    'mogłybyśmy': { type: 'verb_form', infinitive: 'móc', form: 'conditional feminine plural' },
    'moglibyśmy': { type: 'verb_form', infinitive: 'móc', form: 'conditional masculine plural' },
    'poproszę': { type: 'verb_form', infinitive: 'prosić', person: '1sg', tense: 'future' },
    'proszę': { type: 'verb_form', infinitive: 'prosić', person: '1sg', tense: 'present' },
    'są': { type: 'verb_form', infinitive: 'być', person: '3pl', tense: 'present' },
    'będzie': { type: 'verb_form', infinitive: 'być', person: '3sg', tense: 'future' },
    'był': { type: 'verb_form', infinitive: 'być', form: 'past masculine' },
    'była': { type: 'verb_form', infinitive: 'być', form: 'past feminine' },
    'było': { type: 'verb_form', infinitive: 'być', form: 'past neuter' },
    'Było': { type: 'verb_form', infinitive: 'być', form: 'past neuter' },
    'jest': { type: 'verb_form', infinitive: 'być', person: '3sg', tense: 'present' },
    'Jest': { type: 'verb_form', infinitive: 'być', person: '3sg', tense: 'present' },
    'Chciałabym': { type: 'verb_form', infinitive: 'chcieć', form: 'conditional feminine' },
    'Sprawdzę': { type: 'verb_form', infinitive: 'sprawdzić', person: '1sg', tense: 'future' },
    'Dziękuję': { type: 'verb_form', infinitive: 'dziękować', person: '1sg', tense: 'present' },
    'dziękujemy': { type: 'verb_form', infinitive: 'dziękować', person: '1pl', tense: 'present' },
    'Dziękujemy': { type: 'verb_form', infinitive: 'dziękować', person: '1pl', tense: 'present' },
    'smakuje': { type: 'verb_form', infinitive: 'smakować', person: '3sg', tense: 'present' },
    'smakowało': { type: 'verb_form', infinitive: 'smakować', form: 'past neuter' },
    'zostawiamy': { type: 'verb_form', infinitive: 'zostawiać', person: '1pl', tense: 'present' },
    
    // ADJECTIVES (Przymiotniki)
    'dobry': { 
        type: 'adjective', 
        translation: 'хороший', 
        pronunciation: '(ДО-бры)', 
        etymology: 'От праславянского *dobrъ.',
        info: 'Прилагательное, которое изменяется по родам: dobry (m), dobra (f), dobre (n)',
        declension: {
            masculine: { nom: 'dobry', gen: 'dobrego', dat: 'dobremu', acc: 'dobry/dobrego', ins: 'dobrym', loc: 'dobrym' },
            feminine: { nom: 'dobra', gen: 'dobrej', dat: 'dobrej', acc: 'dobrą', ins: 'dobrą', loc: 'dobrej' },
            neuter: { nom: 'dobre', gen: 'dobrego', dat: 'dobremu', acc: 'dobre', ins: 'dobrym', loc: 'dobrym' }
        },
        examples: [
            { polish: 'To jest dobry pomysł.', russian: 'Это хорошая идея.' },
            { polish: 'Mam dobrego przyjaciela.', russian: 'У меня есть хороший друг.' }
        ],
        related: ['zły', 'świetny', 'doskonały']
    },
    'jogurtowy': { 
        type: 'adjective', 
        translation: 'йогуртовый', 
        pronunciation: '(йо-ГУР-то-вы)', 
        etymology: 'От "jogurt" + суффикс "-owy".',
        examples: [
            { polish: 'Sos jogurtowy jest lekki.', russian: 'Йогуртовый соус легкий.' },
            { polish: 'Czy macie dressing jogurtowy?', russian: 'Есть ли у вас йогуртовая заправка?' }
        ],
        related: ['jogurt', 'sos', 'mleczny']
    },
    'orzechowy': { 
        type: 'adjective', 
        translation: 'ореховый', 
        pronunciation: '(о-же-ХО-вы)', 
        etymology: 'От "orzech" (орех) + суффикс "-owy".',
        examples: [
            { polish: 'Krem orzechowy jest bardzo słodki.', russian: 'Ореховый крем очень сладкий.' },
            { polish: 'Lubię ciasto orzechowe.', russian: 'Люблю ореховый торт.' }
        ],
        related: ['orzech', 'słodki', 'krem']
    },
    
    // MORE MISSING WORDS FROM ERRORS
    'Wyśmienite': { 
        type: 'exclamation', 
        translation: 'Превосходно!', 
        pronunciation: '(вы-шьме-НИ-те)', 
        etymology: 'От "wyśmienity" (превосходный).',
        examples: [
            { polish: 'Wyśmienite! To dokładnie to, czego chciałem.', russian: 'Превосходно! Это именно то, чего я хотел.' }
        ],
        related: ['świetny', 'doskonały', 'znakomity']
    },
    'można': { 
        type: 'adverb', 
        translation: 'можно', 
        pronunciation: '(МОЖ-на)', 
        etymology: 'От праславянского *možьno.',
        examples: [
            { polish: 'Czy można prosić o sól?', russian: 'Можно ли попросить соль?' },
            { polish: 'Tutaj można palić?', russian: 'Здесь можно курить?' }
        ],
        related: ['pozwolenie', 'wolno', 'możliwość']
    },
    
    // Continue with all other missing words...
    'potrzebujemy': { type: 'verb_form', infinitive: 'potrzebować', person: '1pl', tense: 'present' },
    'przynoszę': { type: 'verb_form', infinitive: 'przynosić', person: '1sg', tense: 'present' },
    
    // Add base verb for missing forms
    'potrzebować': {
        type: 'verb',
        translation: 'нуждаться',
        pronunciation: '(пот-ше-БО-вачь)',
        aspect: 'niedokonany',
        conjugation_table: {
            present: {
                ja: 'potrzebuję',
                ty: 'potrzebujesz', 
                'on/ona/ono': 'potrzebuje',
                my: 'potrzebujemy',
                wy: 'potrzebujecie',
                'oni/one': 'potrzebują'
            }
        },
        examples: [
            { polish: 'Potrzebujemy więcej czasu.', russian: 'Нам нужно больше времени.' }
        ]
    }
    
    // ... Add all other missing words following the same pattern
};

// Dictionary entries for the vocabulary table
const dictionaryEntries = [
    { polish: 'mieć rezerwację', russian: 'иметь бронь', example: 'Czy mają Panie rezerwację?' },
    { polish: 'stolik przy oknie', russian: 'столик у окна', example: 'Czy mogłybyśmy dostać stolik przy oknie?' },
    { polish: 'złożyć zamówienie', russian: 'сделать заказ', example: 'Czy są Panie gotowe do złożenia zamówienia?' },
    { polish: 'mam alergię', russian: 'у меня аллергия', example: 'Mam alergię na orzechy.' },
    { polish: 'prosić o coś', russian: 'попросить что-то', example: 'Poproszę makaron z warzywami.' },
    { polish: 'smakować', russian: 'быть вкусным', example: 'Czy wszystko smakuje?' },
    { polish: 'deser dnia', russian: 'десерт дня', example: 'Dzisiejszy deser dnia to sernik z malinami.' },
    { polish: 'przynieść rachunek', russian: 'принести счет', example: 'Czy mogę przynieść rachunek?' },
    { polish: 'zostawić napiwek', russian: 'оставить чаевые', example: 'Zostawiamy napiwek.' },
    { polish: 'zapraszam ponownie', russian: 'приглашаю снова', example: 'Dziękuję i zapraszam ponownie!' }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { wordData, dictionaryEntries };
}
