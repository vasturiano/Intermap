define(['data/locations.us'], function(locs) {
    return locs.map(function(loc) {
        return {
            text: loc.city + ' (' + loc.country + ')',
            angle: loc.lon,
            weight: loc.population
        };
    });
});