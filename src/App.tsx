import { useWindowSize } from "@react-hook/window-size";
import Pendulum from "./Pendulum";
import { useState } from "react";

const App = () => {
    const [width, height] = useWindowSize();

    const minArmLength = 100;
    const maxArmLength = (Math.min(width, height) * 0.95) / 2 - 25;

    const [armLength, setArmLength] = useState(
        minArmLength + (maxArmLength - minArmLength) * Math.random()
    );
    const normalizedArmLength = Math.max(
        minArmLength,
        Math.min(armLength, maxArmLength)
    );

    const [pause, setPause] = useState(false);

    return (
        <>
            <Pendulum
                className="center z-n1"
                size={{ width: width - 5, height: height - 5 }}
                length={normalizedArmLength}
                isOnPause={pause}
            />

            <div className="container">
                <div className="row">
                    <div className="col">
                        <label className="form-label">Arm length</label>
                        <input
                            type="range"
                            className="form-range"
                            min={minArmLength}
                            max={maxArmLength}
                            value={normalizedArmLength}
                            onChange={(event) =>
                                setArmLength(() => +event.target.value)
                            }
                        />
                    </div>
                    <div className="col cols-auto align-self-center">
                        <button
                            className="btn btn-primary"
                            onClick={() => setPause((pause) => !pause)}
                        >
                            {pause ? "Resume" : "Pause"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
