import OpenSearchUtils from '../../OpenSearchUtils';

/**
 * Parses GeoRSS and converts it to GeoJSON.
 *
 * The Simple and GML encoding of GeoRSS are supported.
 *
 * @exports OpenSearchGeoRssParser
 */
var OpenSearchGeoRssParser = {

    /**
     * Parses the specified GeoRSS-Simple node as a GeoJSON geometry.
     *
     * @param {Node} node The GeoRSS node.
     *
     * @return {Object} The resulting GeoJSON geometry.
     */
    parseSimple: function (node) {
        var geometry = {
            type: '',
            coordinates: []
        };

        if (node.localName === 'polygon') {
            geometry.type = 'Polygon';
            geometry.coordinates.push(OpenSearchGeoRssParser.parseLocations(node));
        }
        else if (node.localName === 'point') {
            geometry.type = 'Point';
            geometry.coordinates = OpenSearchGeoRssParser.parseLocations(node);
        }
        else if (node.localName === 'line') {
            geometry.type = 'LineString';
            geometry.coordinates = OpenSearchGeoRssParser.parseLocations(node);
        }

        return geometry;
    },

    /**
     * Parses the specified GeoRSS-GML node as a GeoJSON geometry.
     *
     * @param {Node} node The GeoRSS node.
     *
     * @return {Object} The resulting GeoJSON geometry.
     */
    parseGml: function (node) {
        var geometry = {
            type: '',
            coordinates: []
        };
        var firstChild = node.firstElementChild;

        switch (firstChild.localName) {
            case 'Point':
                geometry.type = 'Point';
                var posNode = OpenSearchUtils.getXmlElements(firstChild, 'pos')[0];
                if (posNode) {
                    geometry.coordinates = OpenSearchGeoRssParser.parseLocations(posNode);
                }
                break;

            case 'LineString':
                geometry.type = 'LineString';
                var posList = OpenSearchUtils.getXmlElements(firstChild, 'posList')[0];
                if (posList) {
                    geometry.coordinates = OpenSearchGeoRssParser.parseLocations(posList);
                }
                break;

            case 'Polygon':
                geometry.type = 'Polygon';
                geometry.coordinates = OpenSearchGeoRssParser.parseGmlPolygon(firstChild);
                break;

            case 'MultiSurface':
                geometry.type = 'MultiPolygon';
                geometry.coordinates = [OpenSearchGeoRssParser.parseMultiPolygon(firstChild)];
                break;

            default:
                break;
        }

        return geometry;
    },

    /**
     * Parses the specified GeoRSS box node as GeoJSON bounding box.
     *
     * @param {Node} node The GeoRSS box node.
     *
     * @return {Array} The resulting GeoJSON bounding box.
     */
    parseBox: function (node) {
        var locations = OpenSearchGeoRssParser.parseLocations(node);
        return [].concat.apply([], locations);
    },

    /**
     * Extracts the coordinates of the specified GeoRSS node as a GeoJSON coordinates array.
     *
     * @param {Node} node The GeoRSS node.
     *
     * @return {Array} The resulting GeoJSON coordinates array.
     */
    parseLocations: function (node) {
        var points = node.textContent.trim().replace(/\s+/g, ' ').split(' ');
        var locations = [];
        for (var i = 0; i < points.length; i += 2) {
            var lat = +points[i];
            var lon = +points[i + 1];
            locations.push([lon, lat]);
        }
        return locations;
    },

    /**
     * Extracts the coordinates of the specified GeoRSS-GML Polygon node as a GeoJSON coordinates array.
     *
     * @param {Node} node The GeoRSS-GML Polygon node.
     *
     * @return {Array} The resulting GeoJSON coordinates array.
     */
    parseGmlPolygon: function (node) {
        var exteriorPosList = OpenSearchUtils.getXmlElements(node, 'posList')[0];
        var interiorNodes = OpenSearchUtils.getXmlElements(node, 'interior');

        var exteriorLocations = OpenSearchGeoRssParser.parseLocations(exteriorPosList);

        var interiors = [];
        for (var i = 0; i < interiorNodes.length; i++) {
            var interiorPosList = OpenSearchUtils.getXmlElements(interiorNodes[i], 'posList')[0];
            if (interiorPosList) {
                var interiorLocations = OpenSearchGeoRssParser.parseLocations(interiorPosList);
                interiors.push(interiorLocations);
            }
        }

        return exteriorLocations.concat(interiors);
    },

    /**
     * Extracts the coordinates of the specified GeoRSS-GML MultiSurface node as a GeoJSON coordinates array.
     *
     * @param {Node} node The GeoRSS-GML MultiSurface node.
     *
     * @return {Array} The resulting GeoJSON coordinates array.
     */
    parseMultiPolygon: function (node) {
        //node can contain a single 'surfaceMembers' element and/or multiple 'surfaceMember' elements

        var polygons = OpenSearchUtils.getXmlElements(node, 'surfaceMember').map(function (surfaceMember) {
            return OpenSearchUtils.getXmlElements(surfaceMember, 'Polygon');
        });

        var surfaceMembers = OpenSearchUtils.getXmlElements(node, 'surfaceMembers')[0];
        if (surfaceMembers) {
            polygons = polygons.concat(OpenSearchUtils.getXmlElements(surfaceMembers, 'Polygon'));
        }

        return polygons.map(function (polygon) {
            return OpenSearchGeoRssParser.parseGmlPolygon(polygon);
        });
    }

};


export default OpenSearchGeoRssParser;