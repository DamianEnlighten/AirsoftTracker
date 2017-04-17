export class LocationResponse {
    status: string;
    message: string;
    locations: Location[]
}


export class Location {
    deviceId: string;
    lat: number;
    lng: number;
    name: string;
}