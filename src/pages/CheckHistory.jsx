import { useState } from "react";

import WindowSize from "../hooks/windowSize";
import useDBdata from "../hooks/DBdata";

import VideoBtnSmall from "../components/SVG-VideoBtnSmall";

import "./CheckHistory.css";

function CheckHistory() {
  return (
    <div className="CheckHistorySection">
      <div className="historyListBox">
        <ul className="historyLost">
          <li>
            <div className="historyThumnail">
              <VideoBtnSmall />
            </div>
            <div className="historyinfo">
              <h3 className="historyFilename">파일이름</h3>
              <div className="historyDetailBox">
                <p className="historycreatedAt">
                  2025 / 06 / 07
                </p>
                <div className="historyCheckbox">
                  <p>확인여부</p>
                  <div
                    className="checkBoxSmall checkPrev"
                  >대기</div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="historyThumnail">
              <VideoBtnSmall />
            </div>
            <div className="historyinfo">
              <h3 className="historyFilename">파일이름</h3>
              <div className="historyDetailBox">
                <p className="historycreatedAt">
                  2025 / 06 / 07
                </p>
                <div className="historyCheckbox">
                  <p>확인여부</p>
                  <div
                    className="checkBoxSmall checkPrev"
                  >대기</div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="historyThumnail">
              <VideoBtnSmall />
            </div>
            <div className="historyinfo">
              <h3 className="historyFilename">파일이름</h3>
              <div className="historyDetailBox">
                <p className="historycreatedAt">
                  2025 / 06 / 07
                </p>
                <div className="historyCheckbox">
                  <p>확인여부</p>
                  <div
                    className="checkBoxSmall checkPrev"
                  >대기</div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="historyThumnail">
              <VideoBtnSmall />
            </div>
            <div className="historyinfo">
              <h3 className="historyFilename">파일이름</h3>
              <div className="historyDetailBox">
                <p className="historycreatedAt">
                  2025 / 06 / 07
                </p>
                <div className="historyCheckbox">
                  <p>확인여부</p>
                  <div
                    className="checkBoxSmall checkPrev"
                  >대기</div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="historyThumnail">
              <VideoBtnSmall />
            </div>
            <div className="historyinfo">
              <h3 className="historyFilename">파일이름</h3>
              <div className="historyDetailBox">
                <p className="historycreatedAt">
                  2025 / 06 / 07
                </p>
                <div className="historyCheckbox">
                  <p>확인여부</p>
                  <div
                    className="checkBoxSmall checkPrev"
                  >대기</div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="historyThumnail">
              <VideoBtnSmall />
            </div>
            <div className="historyinfo">
              <h3 className="historyFilename">파일이름</h3>
              <div className="historyDetailBox">
                <p className="historycreatedAt">
                  2025 / 06 / 07
                </p>
                <div className="historyCheckbox">
                  <p>확인여부</p>
                  <div
                    className="checkBoxSmall checkPrev"
                  >대기</div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="historyThumnail">
              <VideoBtnSmall />
            </div>
            <div className="historyinfo">
              <h3 className="historyFilename">파일이름</h3>
              <div className="historyDetailBox">
                <p className="historycreatedAt">
                  2025 / 06 / 07
                </p>
                <div className="historyCheckbox">
                  <p>확인여부</p>
                  <div
                    className="checkBoxSmall checkPrev"
                  >대기</div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="historyThumnail">
              <VideoBtnSmall />
            </div>
            <div className="historyinfo">
              <h3 className="historyFilename">파일이름</h3>
              <div className="historyDetailBox">
                <p className="historycreatedAt">
                  2025 / 06 / 07
                </p>
                <div className="historyCheckbox">
                  <p>확인여부</p>
                  <div
                    className="checkBoxSmall checkPrev"
                  >대기</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className="historyListBoxBtn"></div>
    </div>
  );
}

export default CheckHistory;
