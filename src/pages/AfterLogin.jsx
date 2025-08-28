import { useState } from "react";

import DBGraph from "../components/DBGraph";

import "./AfterLogin.css";

import Dum001 from "../hooks/dum001";

function AfterLogin() {
  return (
    <div className="AfterLoginWindowDesktop">
      {/* 더미데이터 */}
      {/* 사용 완료시 삭제 */}
      {/* 더미데이터의 css는 App.css에 위치 */}
      <div className="dumybox001">
        <Dum001 />
      </div>
      <div className="listAndGraphWindowDesktop">
        <div className="listWindowDesktop">
            <div className="DBlistSmall"></div>
        </div>
        <div className="graphWindowDesktop">
            <DBGraph />
        </div>
      </div>
    </div>
  );
}

export default AfterLogin;
