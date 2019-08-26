define(["require", "exports", "chai", "Types/_display/itemsStrategy/Composer"], function (require, exports, chai_1, Composer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Types/_display/itemsStrategy/Composer', function () {
        function getStrategy() {
            return function (options) {
                Object.assign(this, options || {});
            };
        }
        describe('.append()', function () {
            it('should append a strategy to the empty composer', function () {
                var Strategy = getStrategy();
                var composer = new Composer_1.default();
                composer.append(Strategy);
                chai_1.assert.instanceOf(composer.getResult(), Strategy);
            });
            it('should append a strategy to the end', function () {
                var StrategyA = getStrategy();
                var StrategyB = getStrategy();
                var composer = new Composer_1.default();
                composer
                    .append(StrategyA)
                    .append(StrategyB);
                chai_1.assert.instanceOf(composer.getResult(), StrategyB);
                chai_1.assert.isUndefined(composer.getInstance(StrategyA).source);
                chai_1.assert.instanceOf(composer.getInstance(StrategyB).source, StrategyA);
            });
            it('should append a strategy after given', function () {
                var StrategyA = getStrategy();
                var StrategyB = getStrategy();
                var StrategyC = getStrategy();
                var composer = new Composer_1.default();
                composer
                    .append(StrategyA)
                    .append(StrategyB)
                    .append(StrategyC, {}, StrategyA);
                chai_1.assert.instanceOf(composer.getResult(), StrategyB);
                chai_1.assert.isUndefined(composer.getInstance(StrategyA).source);
                chai_1.assert.instanceOf(composer.getInstance(StrategyC).source, StrategyA);
                chai_1.assert.instanceOf(composer.getInstance(StrategyB).source, StrategyC);
            });
        });
        describe('.prepend()', function () {
            it('should prepend a strategy to the empty composer', function () {
                var Strategy = getStrategy();
                var composer = new Composer_1.default();
                composer.prepend(Strategy);
                chai_1.assert.instanceOf(composer.getResult(), Strategy);
            });
            it('should prepend a strategy to the begin', function () {
                var StrategyA = getStrategy();
                var StrategyB = getStrategy();
                var composer = new Composer_1.default();
                composer
                    .prepend(StrategyA)
                    .prepend(StrategyB);
                chai_1.assert.instanceOf(composer.getResult(), StrategyA);
                chai_1.assert.isUndefined(composer.getInstance(StrategyB).source);
                chai_1.assert.instanceOf(composer.getInstance(StrategyA).source, StrategyB);
            });
            it('should prepend a strategy before given', function () {
                var StrategyA = getStrategy();
                var StrategyB = getStrategy();
                var StrategyC = getStrategy();
                var composer = new Composer_1.default();
                composer
                    .prepend(StrategyA)
                    .prepend(StrategyB)
                    .prepend(StrategyC, {}, StrategyA);
                chai_1.assert.instanceOf(composer.getResult(), StrategyA);
                chai_1.assert.isUndefined(composer.getInstance(StrategyB).source);
                chai_1.assert.instanceOf(composer.getInstance(StrategyC).source, StrategyB);
                chai_1.assert.instanceOf(composer.getInstance(StrategyA).source, StrategyC);
            });
        });
        describe('.remove()', function () {
            it('should return undefined for empty composer', function () {
                var Strategy = getStrategy();
                var composer = new Composer_1.default();
                chai_1.assert.isUndefined(composer.remove(Strategy));
                chai_1.assert.isNull(composer.getResult());
            });
            it('should return removed instance', function () {
                var StrategyA = getStrategy();
                var StrategyB = getStrategy();
                var StrategyC = getStrategy();
                var composer = new Composer_1.default();
                composer
                    .append(StrategyA)
                    .append(StrategyB)
                    .append(StrategyC);
                chai_1.assert.instanceOf(composer.remove(StrategyB), StrategyB);
                chai_1.assert.instanceOf(composer.getResult(), StrategyC);
                chai_1.assert.isUndefined(composer.getInstance(StrategyA).source);
                chai_1.assert.isUndefined(composer.getInstance(StrategyB));
                chai_1.assert.instanceOf(composer.getInstance(StrategyC).source, StrategyA);
            });
            it('should affect result', function () {
                var StrategyA = getStrategy();
                var StrategyB = getStrategy();
                var composer = new Composer_1.default();
                composer
                    .append(StrategyA)
                    .append(StrategyB);
                chai_1.assert.instanceOf(composer.remove(StrategyB), StrategyB);
                chai_1.assert.instanceOf(composer.getResult(), StrategyA);
            });
        });
        describe('.reset()', function () {
            it('should reset result', function () {
                var Strategy = getStrategy();
                var composer = new Composer_1.default();
                composer
                    .append(Strategy)
                    .reset();
                chai_1.assert.isNull(composer.getResult());
            });
        });
        describe('.getInstance()', function () {
            it('should return an instance', function () {
                var Strategy = getStrategy();
                var composer = new Composer_1.default();
                composer.append(Strategy);
                chai_1.assert.instanceOf(composer.getInstance(Strategy), Strategy);
            });
            it('should return undefined if strategy not composed', function () {
                var Strategy = getStrategy();
                var composer = new Composer_1.default();
                chai_1.assert.isUndefined(composer.getInstance(Strategy));
            });
        });
        describe('.getResult()', function () {
            it('should return null by default', function () {
                var composer = new Composer_1.default();
                chai_1.assert.isNull(composer.getResult());
            });
            it('should return instance of given stratgey', function () {
                var Strategy = getStrategy();
                var composer = new Composer_1.default();
                composer.append(Strategy);
                chai_1.assert.instanceOf(composer.getResult(), Strategy);
            });
        });
    });
});
