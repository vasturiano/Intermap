define([], function() {

    // Given some sides and angles, this returns a tuple of 8 number/string values.
    // angle A is opposite to side a, etc
    // angles in degrees (0-360)
    function solveTriangle(a, b, c, A, B, C) {
        var sides  = (a != null) + (b != null) + (c != null);  // Boolean to integer conversion
        var angles = (A != null) + (B != null) + (C != null);  // Boolean to integer conversion
        var area, status;

        if (sides + angles != 3)
            throw "Give exactly 3 pieces of information";
        else if (sides == 0)
            throw "Give at least one side length";

        else if (sides == 3) {
            status = "Side side side (SSS) case";
            if (lessEqual(a + b, c) || lessEqual(b + c, a) || lessEqual(c + a, b))
                throw status + " - No solution";
            A = solveAngle(b, c, a);
            B = solveAngle(c, a, b);
            C = solveAngle(a, b, c);
            // Heron's formula
            var s = (a + b + c) / 2;
            area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

        } else if (angles == 2) {
            status = "Angle side angle (ASA) case";
            // Find missing angle
            if (A == null) A = 180 - B - C;
            if (B == null) B = 180 - C - A;
            if (C == null) C = 180 - A - B;
            if (lessEqual(A, 0) || lessEqual(B, 0) || lessEqual(C, 0))
                throw status + " - No solution";
            var sinA = Math.sin(degToRad(A));
            var sinB = Math.sin(degToRad(B));
            var sinC = Math.sin(degToRad(C));
            // Use law of sines to find sides
            var ratio;  // side / sin(angle)
            if (a != null) { ratio = a / sinA; area = a * ratio * sinB * sinC / 2; }
            if (b != null) { ratio = b / sinB; area = b * ratio * sinC * sinA / 2; }
            if (c != null) { ratio = c / sinC; area = c * ratio * sinA * sinB / 2; }
            if (a == null) a = ratio * sinA;
            if (b == null) b = ratio * sinB;
            if (c == null) c = ratio * sinC;

        } else if (and(A != null, a == null) || and(B != null, b == null) || and(C != null, c == null)) {
            status = "Side angle side (SAS) case";
            if (and(A != null, A >= 180) || and(B != null, B >= 180) || and(C != null, C >= 180))
                throw status + " - No solution";
            if (a == null) a = solveSide(b, c, A);
            if (b == null) b = solveSide(c, a, B);
            if (c == null) c = solveSide(a, b, C);
            if (A == null) A = solveAngle(b, c, a);
            if (B == null) B = solveAngle(c, a, b);
            if (C == null) C = solveAngle(a, b, c);
            if (A != null) area = b * c * Math.sin(degToRad(A)) / 2;
            if (B != null) area = c * a * Math.sin(degToRad(B)) / 2;
            if (C != null) area = a * b * Math.sin(degToRad(C)) / 2;

        } else {
            status = "Side side angle (SSA) case - ";
            var knownSide, knownAngle, partialSide;
            if (and(a != null, A != null)) { knownSide = a; knownAngle = A; }
            if (and(b != null, B != null)) { knownSide = b; knownAngle = B; }
            if (and(c != null, C != null)) { knownSide = c; knownAngle = C; }
            if (and(a != null, A == null)) partialSide = a;
            if (and(b != null, B == null)) partialSide = b;
            if (and(c != null, C == null)) partialSide = c;
            if (knownAngle >= 180)
                throw status + "No solution";
            var ratio = knownSide / Math.sin(degToRad(knownAngle));
            var temp = partialSide / ratio;  // sin(partialAngle)
            var partialAngle, unknownSide, unknownAngle;
            if (temp > 1 || and(knownAngle >= 90, lessEqual(knownSide, partialSide)))
                throw status + "No solution";
            else if (temp == 1 || knownSide >= partialSide) {
                status += "Unique solution";
                partialAngle = radToDeg(Math.asin(temp));
                unknownAngle = 180 - knownAngle - partialAngle;
                unknownSide = ratio * Math.sin(degToRad(unknownAngle));  // Law of sines
                area = knownSide * partialSide * Math.sin(degToRad(unknownAngle)) / 2;
            } else {
                status += "Two solutions";
                var partialAngle0 = radToDeg(Math.asin(temp));
                var partialAngle1 = 180 - partialAngle0;
                var unknownAngle0 = 180 - knownAngle - partialAngle0;
                var unknownAngle1 = 180 - knownAngle - partialAngle1;
                var unknownSide0 = ratio * Math.sin(degToRad(unknownAngle0));  // Law of sines
                var unknownSide1 = ratio * Math.sin(degToRad(unknownAngle1));  // Law of sines
                partialAngle = [partialAngle0, partialAngle1];
                unknownAngle = [unknownAngle0, unknownAngle1];
                unknownSide = [unknownSide0, unknownSide1];
                area = [knownSide * partialSide * Math.sin(degToRad(unknownAngle0)) / 2,
                        knownSide * partialSide * Math.sin(degToRad(unknownAngle1)) / 2];
            }
            if (and(a != null, A == null)) A = partialAngle;
            if (and(b != null, B == null)) B = partialAngle;
            if (and(c != null, C == null)) C = partialAngle;
            if (and(a == null, A == null)) { a = unknownSide; A = unknownAngle; }
            if (and(b == null, B == null)) { b = unknownSide; B = unknownAngle; }
            if (and(c == null, C == null)) { c = unknownSide; C = unknownAngle; }
        }

        return [a, b, c, A, B, C, area, status];
    }


    // Returns side c using law of cosines.
    function solveSide(a, b, C) {
        C = degToRad(C);
        if (C > 0.001)
            return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
        else  // Explained in http://www.nayuki.io/page/numerically-stable-law-of-cosines
            return Math.sqrt((a - b) * (a - b) + a * b * C * C * (1 - C * C / 12));
    }


    // Returns angle C using law of cosines.
    function solveAngle(a, b, c) {
        var temp = (a * a + b * b - c * c) / (2 * a * b);
        if (and(lessEqual(-1, temp), lessEqual(temp, 0.9999999)))
            return radToDeg(Math.acos(temp));
        else if (lessEqual(temp, 1))  // Explained in http://www.nayuki.io/page/numerically-stable-law-of-cosines
            return radToDeg(Math.sqrt((c * c - (a - b) * (a - b)) / (a * b)));
        else
            throw "No solution";
    }

    function degToRad(x) {
        return x / 180 * Math.PI;
    }

    function radToDeg(x) {
        return x / Math.PI * 180;
    }

    function lessEqual(x, y) {
        return y >= x;
    }

    function and(x, y) {
        return x ? y : false;
    }

    return solveTriangle;
});