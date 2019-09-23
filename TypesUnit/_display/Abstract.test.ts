import {assert} from 'chai';
import Display from 'Types/_display/Abstract';
import Collection from 'Types/_display/Collection';
import CollectionItem from 'Types/_display/CollectionItem';
import List from 'Types/_collection/List';
import EnumType from 'Types/_collection/Enum';
import EnumDisplay from 'Types/_display/Enum';
import FlagsType from 'Types/_collection/Flags';
import FlagsDisplay from 'Types/_display/Flags';
import 'Types/display';

describe('Types/_display/Abstract', () => {
    describe('.getDefaultDisplay()', () => {
        it('should return a display', () => {
            const list = new List();

            assert.instanceOf(Display.getDefaultDisplay(list), Display);
        });

        it('should return the special display for Array', () => {
            const options = {keyProperty: 'foo'};
            const display = Display.getDefaultDisplay<string, CollectionItem<string>, Collection<string>>([], options);
            assert.instanceOf(display, Collection);
            assert.equal(display.getKeyProperty(), options.keyProperty);
        });

        it('should return the special display for List', () => {
            const collection = new List();
            const display = Display.getDefaultDisplay(collection);
            assert.instanceOf(display, Collection);
        });

        it('should return the special display for Enum', () => {
            const collection = new EnumType();
            const display = Display.getDefaultDisplay(collection);
            assert.instanceOf(display, EnumDisplay);
        });

        it('should return the special display for Flags', () => {
            const collection = new FlagsType();
            const display = Display.getDefaultDisplay(collection);
            assert.instanceOf(display, FlagsDisplay);
        });

        it('should throw an error for not IEnumerable', () => {
            assert.throws(() => {
                Display.getDefaultDisplay({} as any);
            });
            assert.throws(() => {
                Display.getDefaultDisplay(null);
            });
            assert.throws(() => {
                Display.getDefaultDisplay(undefined);
            });
        });

        it('should return various instances', () => {
            const list = new List();
            const displayA = Display.getDefaultDisplay(list);
            const displayB = Display.getDefaultDisplay(list);

            assert.notEqual(displayA, displayB);
        });

        it('should return same instances', () => {
            const list = new List();
            const displayA = Display.getDefaultDisplay(list, {}, true);
            const displayB = Display.getDefaultDisplay(list, {}, true);

            assert.strictEqual(displayA, displayB);
        });
    });

    describe('.releaseDefaultDisplay()', () => {
        it('should return true if the display has been retrieved as singleton', () => {
            const list = new List();
            const display = Display.getDefaultDisplay(list, {}, true);

            assert.isTrue(Display.releaseDefaultDisplay(display));
        });

        it('should return true if the display has been retrieved as not singleton', () => {
            const list = new List();
            const display = Display.getDefaultDisplay(list);

            assert.isFalse(Display.releaseDefaultDisplay(display));
        });

        it('should destroy the instance after last one was released', () => {
            const list = new List();
            const displayA = Display.getDefaultDisplay(list, {}, true);
            const displayB = Display.getDefaultDisplay(list, {}, true);

            Display.releaseDefaultDisplay(displayA);
            assert.isFalse(displayA.destroyed);

            Display.releaseDefaultDisplay(displayB);
            assert.isTrue(displayA.destroyed);
            assert.isTrue(displayB.destroyed);
        });

        it('should force getDefaultDisplay return a new instance after last one was released', () => {
            const list = new List();
            const displayA = Display.getDefaultDisplay(list, {}, true);
            const displayB = Display.getDefaultDisplay(list, {}, true);

            Display.releaseDefaultDisplay(displayA);
            Display.releaseDefaultDisplay(displayB);

            const displayC = Display.getDefaultDisplay(list, {}, true);
            assert.notEqual(displayC, displayA);
            assert.notEqual(displayC, displayB);
        });
    });
});
