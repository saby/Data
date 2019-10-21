import {assert} from 'chai';
import JSONML from 'Types/_entity/JSONML';

describe('Types/entity:JSONML', () => {
    const TEXT_JSONML = 'Hello world';
    const attributes = {class: 'someClass'};
    const children = ['Hello world'];

    const SIMPLE_NODE_JSONML = ['p'];
    const SIMPLE_NODE_WITH_ATTRS_JSONML = ['p', attributes];
    const SIMPLE_NODE_WITH_CHILDREN = ['p', ...children];
    const SIMPLE_NODE_WITH_ATTRS_CHILDREN = ['p', attributes, ...children];
    const FEW_NODES = [
        SIMPLE_NODE_JSONML,
        SIMPLE_NODE_WITH_ATTRS_CHILDREN,
        SIMPLE_NODE_WITH_ATTRS_JSONML,
        SIMPLE_NODE_WITH_CHILDREN,
    ];

    describe('isNode', () => {
        it('should return true', () => {
            assert.isTrue(JSONML.isNode(SIMPLE_NODE_JSONML));
            assert.isTrue(JSONML.isNode(SIMPLE_NODE_WITH_CHILDREN));
            assert.isTrue(JSONML.isNode(SIMPLE_NODE_WITH_ATTRS_JSONML));
            assert.isTrue(JSONML.isNode(SIMPLE_NODE_WITH_ATTRS_CHILDREN));
        });
        it('should return false', () => {
            assert.isFalse(JSONML.isNode(FEW_NODES));
            assert.isFalse(JSONML.isNode(TEXT_JSONML));
        });
    });

    describe('hasAttributes', () => {
        it('should return true', () => {
           assert.isTrue(JSONML.hasAttributes(SIMPLE_NODE_WITH_ATTRS_JSONML));
           assert.isTrue(JSONML.hasAttributes(SIMPLE_NODE_WITH_ATTRS_CHILDREN));
        });
        it('should return false', () => {
            assert.isFalse(JSONML.hasAttributes(TEXT_JSONML));
            assert.isFalse(JSONML.hasAttributes(SIMPLE_NODE_WITH_CHILDREN));
            assert.isFalse(JSONML.hasAttributes(FEW_NODES));
        });
    });

    describe('getAttributes', () => {
        it('should returns correct value', () => {
            assert.deepEqual(attributes, JSONML.getAttributes(SIMPLE_NODE_WITH_ATTRS_CHILDREN));
            assert.deepEqual(attributes, JSONML.getAttributes(SIMPLE_NODE_WITH_ATTRS_JSONML));
            assert.isUndefined(JSONML.getAttributes(SIMPLE_NODE_WITH_CHILDREN));
            assert.isUndefined(JSONML.getAttributes(FEW_NODES));
        });
    });

    describe('hasChildNodes', () => {
        it('should return true', () => {
            assert.isTrue(JSONML.hasChildNodes(SIMPLE_NODE_WITH_CHILDREN));
            assert.isTrue(JSONML.hasChildNodes(SIMPLE_NODE_WITH_ATTRS_CHILDREN));
        });
        it('should return false', () => {
            assert.isFalse(JSONML.hasChildNodes(TEXT_JSONML));
            assert.isFalse(JSONML.hasChildNodes(SIMPLE_NODE_WITH_ATTRS_JSONML));
            assert.isFalse(JSONML.hasChildNodes(FEW_NODES));
        });
    });

    describe('getChildren', () => {
        it('should return correct value', () => {
            assert.deepEqual(children, JSONML.getChildren(SIMPLE_NODE_WITH_CHILDREN));
            assert.deepEqual(children, JSONML.getChildren(SIMPLE_NODE_WITH_ATTRS_CHILDREN));
            assert.isUndefined(JSONML.getChildren(TEXT_JSONML));
            assert.isUndefined(JSONML.getChildren(FEW_NODES));
        });
    });
});
