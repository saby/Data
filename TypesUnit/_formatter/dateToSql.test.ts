import {assert} from 'chai';
import {stub} from 'sinon';
import dateToSql, {MODE} from 'Types/_formatter/dateToSql';

describe('Types/_formatter/dateToSql', () => {
    function patchTzo(date: Date, offset: number): void {
        (date as any).tzoStub = stub(date, 'getTimezoneOffset');
        (date as any).tzoStub.returns(offset);
    }

    function revertTzo(date: Date): void {
        (date as any).tzoStub.restore();
        delete (date as any).tzoStub;
    }

    it('should return date and time if mode is not defined', () => {
       const dt = new Date(2010, 1, 20, 23, 59, 9);
       patchTzo(dt, 0);
       assert.equal(dateToSql(dt), '2010-02-20 23:59:09+00');
       revertTzo(dt);
    });

    it('should return date and time', () => {
       const dt = new Date(2010, 1, 20, 23, 59, 9);
       patchTzo(dt, 0);
       assert.equal(dateToSql(dt, MODE.DATETIME), '2010-02-20 23:59:09+00');
       revertTzo(dt);
    });

    it('should return positive timezone for negative offset', () => {
       const dt = new Date(2010, 1, 20, 23, 59, 9);
       patchTzo(dt, -60);
       assert.equal(dateToSql(dt), '2010-02-20 23:59:09+01');
       revertTzo(dt);
    });

    it('should return negative timezone for positive offset', () => {
       const dt = new Date(2010, 1, 20, 23, 59, 9);
       patchTzo(dt, 60);
       assert.equal(dateToSql(dt), '2010-02-20 23:59:09-01');
       revertTzo(dt);
    });

    it('should return timezone without minutes', () => {
       const dt = new Date(2010, 1, 20, 23, 59, 9);
       patchTzo(dt, 10 * 60);
       assert.equal(dateToSql(dt), '2010-02-20 23:59:09-10');
       revertTzo(dt);
    });

    it('should return timezone with minutes', () => {
       const dt = new Date(2010, 1, 20, 23, 59, 9);
       patchTzo(dt, 10 * 60 + 20);
       assert.equal(dateToSql(dt), '2010-02-20 23:59:09-10:20');
       revertTzo(dt);
    });

    it('should return date and time whith milisenconds if there are defined', () => {
       const dt = new Date(1443099268981);
       patchTzo(dt, 0);
       assert.equal(dateToSql(dt, MODE.DATETIME), '2015-09-24 15:54:28.981+00');
       revertTzo(dt);
    });

    it('should return date', () => {
       const dt = new Date(2010, 1, 20, 23, 59, 9);
       assert.equal(dateToSql(dt, MODE.DATE), '2010-02-20');
    });

    it('should return time', () => {
       const dt = new Date(2010, 1, 20, 23, 59, 9);
       patchTzo(dt, 0);
       assert.equal(dateToSql(dt, MODE.TIME), '23:59:09+00');
       revertTzo(dt);
    });

    it('should return time without offset for date before Unix epoch', () => {
       const dt = new Date(0, 0, 1, 18, 0, 0);
       assert.equal(dateToSql(dt, MODE.TIME), '18:00:00');
    });

    it('should format with date and time by default', () => {
       const date = new Date(2001, 2, 3, 4, 5, 6);
       patchTzo(date, 60);
       assert.equal(dateToSql(date), '2001-03-03 04:05:06-01');
       revertTzo(date);
    });

    it('should format with date and time', () => {
       const date = new Date(2001, 2, 3, 4, 5, 6);
       patchTzo(date, 60);
       assert.equal(dateToSql(date, MODE.DATETIME), '2001-03-03 04:05:06-01');
       revertTzo(date);
    });

    it('should format with date and time and milliseconds', () => {
       const date = new Date(2001, 2, 3, 4, 5, 6, 7);
       patchTzo(date, 0);
       assert.equal(dateToSql(date, MODE.DATETIME), '2001-03-03 04:05:06.007+00');
       revertTzo(date);
    });

    it('should format with date', () => {
       const date = new Date(2001, 2, 3);
       assert.equal(dateToSql(date, MODE.DATE), '2001-03-03');
    });

    it('should format with time', () => {
       const date = new Date(2001, 2, 3, 4, 5, 6);
       patchTzo(date, 60);
       assert.equal(dateToSql(date, MODE.TIME), '04:05:06-01');
       revertTzo(date);
    });

    it('should format with time and milliseconds', () => {
       const date = new Date(2001, 2, 3, 4, 5, 6, 70);
       patchTzo(date, 0);
       assert.equal(dateToSql(date, MODE.TIME), '04:05:06.070+00');
       revertTzo(date);
    });
});
