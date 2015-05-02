(function() {
    var module = angular.module("quantumofcells", ["qoc-chart", "qoc-solver"]);

    module.controller("QOCController", function($scope, QOCSolver, QOCTools) {
        // HighCharts options
        $scope.options = {
            chart: {
                type: "spline"
            },
            legend: {
                floating: true,
                verticalAlign: "top"
            },
            plotOptions: {
                series: {
                    animation: false,
                    lineWidth: 3,
                    states: { hover: false },
                    marker: {
                        enabled: false,
                        states: { hover: false }
                    }
                }
            },
            tooltip: {
                enabled: false
            },
            title: {
                text: ""
            },
            xAxis: {
                title: { text: "Time (s)" }
            },
            yAxis: {
                title: { text: "" }
            }
        };

        $scope.changeToNewton = function() {
            var eqn = { variable: "temp", expression: "2 * (outerTemp - temp) / 60" };
            var vars = { temp: 0, outerTemp: 20 };
            var time = 120;
            var res = 250;

            var d = QOCSolver.solve(eqn, vars, time, res);
            d = QOCTools.dataToHighCharts(d, 500);

            // Add solution for reference
            d[1] = {
                color: "red",
                dashStyle: "dot",
                data: [],
                name: "Solution"
            };
            for (var i = 0; i < 1000; i++) {
                var t = i / 1000 * time;
                d[1].data.push([t, (20 + (-20) * Math.pow(Math.E, -2 * t/60))]);
            }

            $scope.data = d;
        };

        $scope.changeToTrig = function() {
            var eqn = { variable: "dcos", expression: "pow(t, 2) + 5 * t + 2 / (t + 1)" };
            var vars = { dcos: 0 };
            var time = 10;
            var res = 1000;

            var d = QOCSolver.solve(eqn, vars, time, res);
            d = QOCTools.dataToHighCharts(d, 500);

            // Add sin(x) for reference
            d[1] = {
                color: "red",
                dashStyle: "dot",
                data: [],
                name: "Solution"
            };
            // for (var i = 0; i < 1000; i++) {
            //     //d[1].data.push([i / 1000 * 10, Math.sin(i / 1000 * 10)]);
            //     d[1].data.push([i / 100, Math.sin(i / 100) + 3]);
            // }
            // 
            for (var i = 0; i < time * res; i++) {
                d[1].data.push([i/res, Math.pow(i / res, 3) / 3 +
                               Math.pow(i / res, 2) * 5 / 2 +
                               2   * Math.log(i / res + 1)]); // t is always positive, so no need for ln |t|
            }

            $scope.data = d;
        };

        $scope.changeToLogistic = function() {
            var eqn = { variable: "n", expression: "r * n * (K - n) / K" };
            var vars = { n: 10, r: 1, K: 100000 };
            var time = 20;
            var res = 250;

            var d = QOCSolver.solve(eqn, vars, time, res);
            d = QOCTools.dataToHighCharts(d, 500);

            // Add logistic function for reference
            d[1] = {
                color: "red",
                dashStyle: "dot",
                data: [],
                name: "Solution"
            };
            for (var i = 0; i < 1000; i++) {
                var t = i / 1000 * time;

                d[1].data.push([t, 100000 * Math.pow(Math.E, t) / (10000 + Math.pow(Math.E, t))]);
            }

            $scope.data = d;
        };

        $scope.changeToMultiple = function() {
            var eqns = [
                { variable: "n", expression: "r * n * (K - n) / K" },
                { variable: "q", expression: "0.1 * dcos" },
                { variable: "dcos", expression: "50000 * Math.cos(t)" }
            ];
            eqns = [
                { variable: "S", expression: "c*R - a*S*I" },
                { variable: "I", expression: "a*S*I - b*I" },
                { variable: "R", expression: "b*I - c*R" }
            ];

            var vars = { q: 0, dcos: 50000, n: 10, r: 1, K: 100000 };
            vars = {
                S: 1,  // Initial susceptible population
                I: 10e-3,
                R: 0,
                a: 0.1507, // Infection rate
                b: 0.063, // Recovery rate
                c: 0.0  // Loss of immunity rate
            };
            var time = 200;
            var res = 5;

            var d = QOCSolver.solve(eqns, vars, time, res);
            d = QOCTools.dataToHighCharts(d, 500);
            console.log(d);

            $scope.data = d;
        };

        // Default to multiple
        //$scope.changeToMultiple();

        $scope.equations = [{ variable: "A", expression: "cos(t)" }];
        $scope.parameters = [{ symbol: "A", value: 3 }];
        $scope.addEquation = function() {
            $scope.equations.push({ variable: "", expression: "" });
        };
        $scope.addParameter = function() {
            $scope.parameters.push({ symbol: "", value: "" });
        };
        $scope.simulate = function() {
            var paramMap = {};
            for (p in $scope.parameters) {
                p = $scope.parameters[p];
                paramMap[p.symbol] = parseFloat(p.value);
            }

            var time = 10;
            var resolution = 500;
            var result = QOCSolver.solve($scope.equations, paramMap, time, resolution);
            console.log(result);
            $scope.data = QOCTools.dataToHighCharts(result, 500);
        };
    });

    module.value("QOCTools", {
        dataToHighCharts: function(data, points) {
            points = points || 500;
            var hcData = [];

            for (variable in data) {
                var values = data[variable];
                var series = { name: variable, data: [] };

                for (var i = 0; i < points; i++) {
                    var percentile = i / (points - 1);
                    var indexAtPercentile = Math.ceil((values.length - 1) * percentile);

                    series.data.push(values[indexAtPercentile]);
                }

                hcData.push(series);
            }

            return hcData;
        }
    });
})();