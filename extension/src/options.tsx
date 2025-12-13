import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Storage } from "./storage";

const Options = () => {
  const [color, setColor] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [like, setLike] = useState<boolean>(false);

  useEffect(() => {
    Storage.get(["favoriteColor", "likesColor"]).then((items) => {
      setColor((items.favoriteColor as string) || "red");
      setLike((items.likesColor as boolean) ?? true);
    });
  }, []);

  const saveOptions = () => {
    Storage.set({
      favoriteColor: color,
      likesColor: like,
    }).then(() => {
      setStatus("Options saved.");
      const id = setTimeout(() => {
        setStatus("");
      }, 1000);
      return () => clearTimeout(id);
    });
  };

  return (
    <>
      <div>
        Favorite color: <select
          value={color}
          onChange={(event) => setColor(event.target.value)}
        >
          <option value="red">red</option>
          <option value="green">green</option>
          <option value="blue">blue</option>
          <option value="yellow">yellow</option>
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={like}
            onChange={(event) => setLike(event.target.checked)}
          />
          I like colors.
        </label>
      </div>
      <div>{status}</div>
      <button onClick={saveOptions}>Save</button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
