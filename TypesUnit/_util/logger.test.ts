import {assert} from 'chai';
import logger from 'Types/_util/logger';

describe('Types/_util/object', () => {
    describe('.logger', () => {
        it('should have log() method', () => {
            assert.isFunction(logger.log);
        });

        it('should have error() method', () => {
            assert.isFunction(logger.error);
        });

        it('should have info() method', () => {
            assert.isFunction(logger.info);
        });

        it('should have stack() method', () => {
            assert.isFunction(logger.stack);
        });
     });
});
