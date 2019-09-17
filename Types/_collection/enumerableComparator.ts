import IObservable from './IObservable';
import IEnumerable from './IEnumerable';

let sessionId = 0;

/**
 * Возвращает уникальный идентификатор сессии
 */
function getId(): number {
    if (sessionId > 65534) {
        sessionId = 0;
    }
    return sessionId++;
}

/**
 * Извлекает элементы коллекции
 * @param collection Коллекция
 * @param [contentsWrapper] Название метода, возвращающего содержимое элемента коллекции
 */
function extractItems(collection: IEnumerable<any>, contentsWrapper?: string): any {
    const enumerator = collection.getEnumerator();
    const items = [];
    const contents = [];
    let item;
    enumerator.reset();
    while (enumerator.moveNext()) {
        item = enumerator.getCurrent();
        items.push(item);
        if (contentsWrapper) {
            contents.push(item[contentsWrapper]());
        }
    }

    return {
        items,
        contents: contentsWrapper ? contents : null
    };
}

export interface ISession {
    id: number;
    before: any[];
    after?: any[];
    beforeContents?: any[];
    afterContents?: any[];
    addedProcessed?: any[];
    removedProcessed?: object;
}

/**
 * Возвращает изменения группы
 * @param groupName Название группы
 * @param session Сессия изменений
 * @param collection Коллекция
 * @param [startFrom=0] Начать с элемента номер
 * @param [offset=0] Смещение элеметов в after относительно before
 */
function getGroupChanges(
    groupName: string,
    session: ISession,
    collection: IEnumerable<any>,
    startFrom?: number,
    offset?: number
): object {
    session.addedProcessed = session.addedProcessed || [];
    session.removedProcessed = session.removedProcessed || {};

    const before = session.before;
    const after = session.after;
    const beforeContents = session.beforeContents;
    const afterContents = session.afterContents;
    const addedProcessed = session.addedProcessed; // индексы новых элементов, которые уже были найдены
    const removedProcessed = session.removedProcessed; // индексы удаленных элементов, которые уже были найдены
    const newItems = [];
    let newItemsIndex = 0;
    const oldItems = [];
    let oldItemsIndex = 0;
    let beforeItem; // элемент до изменений
    let beforeIndex; // индекс элемента до изменений
    let afterItem; // элемент после изменений
    let afterIndex; // индекс элемента после изменений
    let exit = false;
    let index;
    const count = Math.max(before.length, after.length);
    let skip;
    let lookUp;

    startFrom = startFrom || 0;
    offset = offset || 0;

    for (index = startFrom; index < count; index++) {
        beforeItem = before[index];
        afterItem = after[index];
        switch (groupName) {
            case 'added':
                // собираем добавленные элементы
                if (!afterItem) {
                    continue;
                }
                afterIndex = index;

                // ищем индекс с учетом возможных дубликатов
                skip = 0;
                lookUp = true;
                do {
                    beforeIndex = before.indexOf(afterItem, skip);
                    if (beforeIndex === -1) {
                        lookUp = false;
                    } else if (addedProcessed.indexOf(beforeIndex) > -1) {
                        // этот индекс мы уже находили, значит afterItem - дубль, ищем дальше
                        skip = beforeIndex + 1;
                    } else {
                        if (!newItems.length) {
                            // запомним найденный индекс
                            addedProcessed.push(beforeIndex);
                        }
                        lookUp = false;
                    }
                } while (lookUp);

                // если элемента не было - добавим его в список новых,
                // если был - отдаем накопленный список новых, если там что-то есть
                if (beforeIndex === -1) {
                    // элемент добавлен
                    newItems.push(afterItem);
                    newItemsIndex = newItems.length === 1 ? afterIndex : newItemsIndex;
                } else if (newItems.length) {
                    exit = true;
                }
                break;

            case 'removed':
                // собираем удаленные элементы
                if (!beforeItem) {
                    continue;
                }
                beforeIndex = index;

                // ищем индекс с учетом возможных дубликатов
                skip = 0;
                lookUp = true;
                do {
                    afterIndex = after.indexOf(beforeItem, skip);
                    if (afterIndex === -1) {
                        lookUp = false;
                    } else if (removedProcessed[afterIndex]) {
                        // этот индекс мы уже находили, значит beforeItem - дубль, ищем дальше
                        skip = afterIndex + 1;
                    } else {
                        if (!oldItems.length) {
                            // запомним найденный индекс
                            removedProcessed[afterIndex] = true;
                        }
                        lookUp = false;
                    }
                } while (lookUp);

                // если элемента не стало - добавим его в список старых,
                // если остался - отдаем накопленный список старых, если там что-то есть
                if (afterIndex === -1) {
                    oldItems.push(beforeItem);
                    oldItemsIndex = oldItems.length === 1 ? beforeIndex : oldItemsIndex;
                } else if (oldItems.length) {
                    exit = true;
                }
                break;

            case 'replaced':
                // собираем замененные элементы
                if (!beforeContents) {
                    index = -1;
                    exit = true;
                    break;
                }
                if (!afterItem) {
                    continue;
                }
                afterIndex = index;
                beforeIndex = before.indexOf(afterItem);

                // если элемент на месте, но изменилось его содержимое - добавим новый в список новых, а для старого
                // генерим новую обертку, которую добавим в список старых
                // если остался - отдаем накопленные списки старых и новых, если в них что-то есть
                if (
                    beforeIndex === afterIndex &&
                    beforeContents[index] !== afterContents[index]
                ) {
                    // FIXME: convertToItem
                    // @ts-ignore
                    oldItems.push(collection._getItemsStrategy().convertToItem(beforeContents[index]));
                    newItems.push(afterItem);
                    oldItemsIndex = newItemsIndex = oldItems.length === 1 ? beforeIndex : oldItemsIndex;
                } else if (oldItems.length) {
                    exit = true;
                }
                break;

            case 'moved':
                // собираем перемещенные элементы
                if (before.length !== after.length) {
                    throw new Error(
                        'The "before" and "after" arrays are not synchronized by the length - "move" can\'t be applied.'
                    );
                }
                if (beforeItem === afterItem) {
                    if (oldItems.length === 0) {
                        continue;
                    }
                    exit = true;
                    break;
                }

                afterIndex = index;
                beforeIndex = before.indexOf(afterItem, index);
                if (beforeIndex !== afterIndex) {
                    if (
                        oldItems.length && beforeIndex !== oldItemsIndex + oldItems.length ||
                        newItems.length && afterIndex !== newItemsIndex + newItems.length
                    ) {
                        exit = true;
                    } else {
                        if (oldItems.length === 0) {
                            oldItemsIndex = beforeIndex;
                        }
                        oldItems.push(afterItem);
                        if (newItems.length === 0) {
                            newItemsIndex = afterIndex;
                        }
                        newItems.push(afterItem);
                    }
                }
                break;
        }
        if (exit) {
            break;
        }
    }

    return {
        newItems,
        newItemsIndex,
        oldItems,
        oldItemsIndex,
        endAt: exit ? index : -1,
        offset
    };
}

/**
 * Применяет изменения группы
 * @param groupName Название группы
 * @param changes Изменения группы
 * @param session Сессия изменений
 */
function applyGroupChanges(groupName: string, changes: any, session: ISession): void {
    const before = session.before;
    const beforeContents = session.beforeContents;
    const afterContents = session.afterContents;

    // Производим с before действия согласно пачке изменений
    switch (groupName) {
        case 'added':
            before.splice(changes.newItemsIndex, 0, ...changes.newItems);

            if (session.addedProcessed) {
                const count = changes.newItems.length;
                for (let i = 0; i < session.addedProcessed.length; i++) {
                    if (session.addedProcessed[i] >= changes.newItemsIndex) {
                        session.addedProcessed[i] += count;
                    }
                }
                for (let i = 0; i < count; i++) {
                    session.addedProcessed.push(changes.newItemsIndex + i);
                }
            }

            if (beforeContents !== null) {
                const added = afterContents.slice(changes.newItemsIndex, changes.newItemsIndex + changes.newItems.length);
                beforeContents.splice(changes.newItemsIndex, 0, ...added);
            }
            break;

        case 'removed':
            before.splice(changes.oldItemsIndex, changes.oldItems.length);
            if (beforeContents !== null) {
                beforeContents.splice(changes.oldItemsIndex, changes.oldItems.length);
            }

            if (changes.endAt !== -1) {
                changes.endAt -= changes.oldItems.length;
            }
            break;

        case 'replaced':
            before.splice(changes.oldItemsIndex, changes.oldItems.length, ...changes.newItems);
            if (beforeContents !== null) {
                const added = afterContents.slice(changes.newItemsIndex, changes.newItemsIndex + changes.newItems.length);
                beforeContents.splice(changes.oldItemsIndex, changes.oldItems.length, ...added);
            }
            break;

        case 'moved':
            const afterSpliceIndex = changes.oldItemsIndex + changes.oldItems.length > changes.newItemsIndex
                ? changes.newItemsIndex
                : changes.newItemsIndex - changes.oldItems.length + 1;

            before.splice(changes.oldItemsIndex, changes.oldItems.length);
            before.splice(afterSpliceIndex, 0, ...changes.newItems);

            if (beforeContents !== null) {
                beforeContents.splice(changes.oldItemsIndex, changes.oldItems.length);
                const added = afterContents.slice(changes.newItemsIndex, changes.newItemsIndex + changes.newItems.length);
                beforeContents.splice(afterSpliceIndex, 0, ...added);
            }

            if (changes.endAt !== -1 && changes.oldItemsIndex < changes.newItemsIndex) {
                changes.endAt -= changes.oldItems.length;
            }
            break;
    }
}

/**
 * Позволяет сравнить две коллекции до и после набора изменений
 * @class Types/_collection/enumerableComparator
 * @author Мальцев А.А.
 */
const enumerableComparator = {
    '[Types/_collection/enumerableComparator]': true,

    /**
     * Запускает сессию изменений коллекции (фиксирует ее состояние до изменений)
     * @param collection Коллекция
     * @param [contentsWrapper] Название метода, возвращающего содержимое элемента коллекции
     */
    startSession(collection: IEnumerable<any>, contentsWrapper?: string): ISession {
        const items = extractItems(collection, contentsWrapper);

        return {
            id: getId(),
            before: items.items,
            beforeContents: items.contents
        };
    },

    /**
     * Завершает сессию изменений коллекции (фиксирует ее состояние после изменений)
     * @param session Сессия изменений
     * @param collection Коллекция
     * @param [contentsWrapper] Название метода, возвращающего содержимое элемента коллекции
     */
    finishSession(session: ISession, collection: IEnumerable<any>, contentsWrapper?: string): void {
        const items = extractItems(collection, contentsWrapper);

        session.after = items.items;
        session.afterContents = items.contents;
    },

    /**
     * Анализирует изменения в коллекции по завершенной сессии
     * @param session Сессия изменений
     * @param collection Коллекция
     * @param callback Функция обратного вызова для каждой пачки изменений
     */
    analizeSession(session: ISession, collection: IEnumerable<any>, callback: Function): void {
        // сначала удаление, потому что в listview при удалении/добалении одного элемента он сначала дублируется потом
        // удаляются оба
        const groups = ['removed', 'added', 'replaced', 'moved'];
        let changes;
        let maxRepeats = Math.max(
            65535,
            groups.length * session.before.length * session.after.length
        );
        let startFrom;
        let offset;
        let groupName;
        let groupAction;

        // Информируем об изменениях по группам
        for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            // Собираем изменения в пачки (следующие подряд наборы элементов коллекции)
            startFrom = 0;
            offset = 0;
            groupName = groups[groupIndex];
            while (startFrom !== -1) {
                // Очередная пачка
                changes = getGroupChanges(
                    groupName,
                    session,
                    collection,
                    startFrom,
                    offset
                );

                // Есть какие-то изменения
                if (changes.newItems.length || changes.oldItems.length) {
                    // Уведомляем
                    if (callback) {
                        groupAction = '';
                        switch (groupName) {
                            case 'added':
                                groupAction = IObservable.ACTION_ADD;
                                break;
                            case 'removed':
                                groupAction = IObservable.ACTION_REMOVE;
                                break;
                            case 'replaced':
                                groupAction = IObservable.ACTION_REPLACE;
                                break;
                            case 'moved':
                                groupAction = IObservable.ACTION_MOVE;
                                break;
                        }
                        callback(groupAction, changes);
                    }

                    // Синхронизируем состояние по пачке
                    applyGroupChanges(
                        groupName,
                        changes,
                        session
                    );
                }

                // Проверяем, все ли хорошо
                if (changes.endAt !== -1 && changes.endAt <= startFrom) {
                    maxRepeats--;
                    if (maxRepeats === 0) {
                        throw new Error('Endless cycle detected.');
                    }
                }

                // Запоминаем, на чем остановились
                startFrom = changes.endAt;
                offset = changes.offset;
            }
        }
    }
};

export default enumerableComparator;
