import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { decode } from 'vlq';
import template from './template';
import './index.less';

interface Sourcemap {
  mappings: string;
}

const transformer = (decoded: number[][][]) => {
  let sourceFileIndex = 0; // second field
  let sourceCodeLine = 0; // third field
  let sourceCodeColumn = 0; // fourth field
  let nameIndex = 0; // fifth field
  return decoded.map((line) => {
    let generatedCodeColumn = 0; // first field - reset each time

    return line.map((segment) => {
      generatedCodeColumn += segment[0] || 0;

      const result = [generatedCodeColumn];

      if (segment.length === 1) {
        // only one field!
        return result;
      }

      sourceFileIndex += segment[1] || 0;
      sourceCodeLine += segment[2] || 0;
      sourceCodeColumn += segment[3] || 0;

      result.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn);

      if (segment.length === 5) {
        nameIndex += segment[4] || 0;
        result.push(nameIndex);
      }

      return result;
    });
  });
};

function App() {
  const [config, setConfig] = useState({});
  const [base64, setBase64] = useState('');
  const [sourcemapInfo, setSourcemapInfo] = useState(JSON.stringify(template.sourcemapInfo));
  const sourcemapInfoObj: Sourcemap = useMemo(() => {
    try {
      return JSON.parse(sourcemapInfo);
    } catch (err) {
      console.log(err);
      return {};
    }
  }, [sourcemapInfo]);
  const shown = useMemo(
    () =>
      transformer(
        sourcemapInfoObj?.mappings
          ?.split(';')
          .map((line) => line.split(','))
          .map((line) => line.map(decode)) || []
      ),
    [sourcemapInfoObj]
  );
  const onChangeSourcemapInfo: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setSourcemapInfo(e.target.value);
  };

  console.log(
    sourcemapInfoObj?.mappings
      ?.split(';')
      .map((line) => line.split(','))
      .map((line) => line.map(decode)) || [],
    shown
  );

  return (
    <div className="container">
      <h1>sourcemap-viewer</h1>
      <div className="stage">
        <textarea className="sourcemap-info-box" value={sourcemapInfo} onChange={onChangeSourcemapInfo} />
        <div className="map-shown-box">
          {shown.map((line, index) => {
            return (
              <ul className="line">
                {line.map((location) => {
                  return (
                    <li className="location">{`第${index + 1}行、第${location[0] + 1}列 => 第${location[2] + 1}行、第${
                      location[3] + 1
                    }列`}</li>
                  );
                })}
              </ul>
            );
          })}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
