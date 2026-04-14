import { MapView } from "../features/map/MapView";

export const Explore = () => {
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Explore Page</h1>
            <MapView />
        </div>
    );
};

export default Explore;