import {assert} from 'chai';
import VersionableMixin, {VersionCallback} from 'Types/_entity/VersionableMixin';

class Entity extends VersionableMixin {
    constructor(callback?: VersionCallback) {
        super();
        this._$versionCallback = callback;
    }

    touch(): void {
        this._nextVersion();
    }
}

describe('Types/_entity/VersionableMixin', () => {
    describe('.versionLocked', () => {
        it('should return false by default', () => {
            const inst = new Entity();
            assert.isFalse(inst.versionLocked);
        });
    });

    describe('.constructor()', () => {
        it('should use given version change handler', () => {
            let lastVersion: number;
            const handler = (version: number) => lastVersion = version;
            const inst = new Entity(handler);

            const initialVersion = lastVersion = inst.getVersion();
            inst.touch();
            assert.notEqual(lastVersion, initialVersion);
        });
    });

    describe('.getVersion()', () => {
        it('should return 0 by default', () => {
            const inst = new Entity();
            assert.strictEqual(inst.getVersion(), 0);
        });

        it('should return new version after a touch', () => {
            const inst = new Entity();
            const initialVersion = inst.getVersion();
            inst.touch();
            assert.notEqual(inst.getVersion(), initialVersion);
        });
    });

    describe('.lockVersion()', () => {
        it('should stop version change', () => {
            const inst = new Entity();

            assert.strictEqual(inst.getVersion(), 0);
            inst.lockVersion();
            inst.touch();
            assert.strictEqual(inst.getVersion(), 0);
        });

        it('should throw an error if already locked', () => {
            const inst = new Entity();
            inst.lockVersion();
            assert.throws(() => {
                inst.lockVersion();
            });
        });
    });

    describe('.unlockVersion()', () => {
        it('should continue version chainge', () => {
            const inst = new Entity();

            inst.lockVersion();
            inst.unlockVersion();
            const initialVersion = inst.getVersion();
            inst.touch();
            assert.notEqual(inst.getVersion(), initialVersion);
        });

        it('should change version if an object has been touched while being locked', () => {
            const inst = new Entity();

            const initialVersion = inst.getVersion();
            inst.lockVersion();
            inst.touch();
            inst.unlockVersion();
            assert.notEqual(inst.getVersion(), initialVersion);
        });

        it('should throw an error if already unlocked', () => {
            const inst = new Entity();
            assert.throws(() => {
                inst.unlockVersion();
            });
        });
    });
});
