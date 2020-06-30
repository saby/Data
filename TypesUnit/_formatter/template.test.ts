import {assert} from 'chai';
import template from 'Types/_formatter/template';

describe('Types/_formatter/template', () => {
    it('should return string without placeholders', () => {
        assert.equal(template('foo', undefined), 'foo');
        assert.equal(template('foo', {}), 'foo');
    });

    it('should return "undefined" with empty placeholder', () => {
        assert.equal(template('${}', null), 'undefined');
    });

    it('should format string with special symbol sequence', () => {
        const scope = {foo: 'bar'};
        assert.equal(template('{${foo}}', scope), '{bar}');
        assert.equal(template('${foo}{}', scope), 'bar{}');
    });

    it('should format string with simple object property', () => {
        const scope = {foo: 'bar'};
        assert.equal(template('${foo}', scope), 'bar');
    });

    it('should format string with hierarchical object property', () => {
        const scope = {foo: {bar: 'baz'}};
        assert.equal(template('${foo.bar}', scope), 'baz');
    });

    it('should format string with several placeholders', () => {
        const scope = {foo: 1, bar: 2};
        assert.equal(template('${foo} + ${bar}', scope), '1 + 2');
    });

    it('should format string with property method evaluation', () => {
        const scope = {foo: 'bar'};
        assert.equal(template('${foo.toUpperCase()}', scope), 'BAR');
    });

    it('should format string with expression evaluation', () => {
        const scope = {foo: 2, bar: 3};
        assert.equal(template('${foo * bar}!', scope), '6!');
    });

    it('should throw ReferenceError or TypeError if value is not defined', () => {
        assert.throws(() => {
            template('${foo}', undefined);
        }, ReferenceError, 'foo is not defined');

        assert.throws(() => {
            template('${foo}', null);
        }, ReferenceError, 'foo is not defined');

        assert.throws(() => {
            template('${foo}', {});
        }, ReferenceError, 'foo is not defined');

        assert.throws(() => {
            template('${foo.bar}', {foo: null});
        }, TypeError, 'Cannot read property \'bar\'');
    });

});
