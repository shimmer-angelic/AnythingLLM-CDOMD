import React, { useEffect, useRef, useState } from "react";
import { AtSign, LogOut, Menu, Package, Plus, Shield } from "react-feather";
import {
  Wrench,
  GithubLogo,
  BookOpen,
  DiscordLogo,
  DotsThree,
} from "@phosphor-icons/react";
import IndexCount from "./IndexCount";
import LLMStatus from "./LLMStatus";
import NewWorkspaceModal, {
  useNewWorkspaceModal,
} from "../Modals/NewWorkspace";
import ActiveWorkspaces from "./ActiveWorkspaces";
import paths from "../../utils/paths";
import useUser from "../../hooks/useUser";
import { userFromStorage } from "../../utils/request";
import { AUTH_TOKEN, AUTH_USER } from "../../utils/constants";
import useLogo from "../../hooks/useLogo";
import SettingsOverlay, { useSystemSettingsOverlay } from "./SettingsOverlay";

export default function Sidebar() {
  const { logo } = useLogo();
  const sidebarRef = useRef(null);
  const { showOverlay } = useSystemSettingsOverlay();
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();

  return (
    <>
      <div
        ref={sidebarRef}
        style={{ height: "calc(100% - 32px)" }}
        className="relative transition-all duration-500 m-[16px] rounded-[26px] bg-sidebar border-4 border-accent min-w-[15.5%] p-[18px] flex flex-col"
      >
        <SettingsOverlay />
        <div className="flex flex-col h-full overflow-x-hidden">
          {/* Header Information */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex shrink-0 max-w-[65%] items-center justify-start">
              <img
                src={logo}
                alt="Logo"
                className="rounded max-h-[40px]"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="flex gap-x-2 items-center text-slate-200">
              {/* <AdminHome /> */}
              <SettingsButton onClick={showOverlay} />
            </div>
          </div>

          {/* Primary Body */}
          <div className="flex-grow flex flex-col">
            <div className="flex flex-col gap-y-4 pb-8 overflow-y-scroll no-scroll">
              <div className="flex gap-x-2 items-center justify-between">
                <button
                  onClick={showNewWsModal}
                  className="flex flex-grow w-[75%] h-[44px] gap-x-2 py-[5px] px-4 bg-white rounded-lg text-sidebar justify-center items-center hover:bg-opacity-80 transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  <p className="text-sidebar text-sm font-semibold">
                    New Workspace
                  </p>
                </button>
              </div>
              <ActiveWorkspaces />
            </div>
            <div className="flex flex-col flex-grow justify-end mb-2">
              {/* <div className="flex flex-col gap-y-2">
                <div className="w-full flex items-center justify-between">
                  <LLMStatus />
                  <IndexCount />
                </div>
                <a
                  href={paths.feedback()}
                  target="_blank"
                  className="flex flex-grow w-[100%] h-[36px] gap-x-2 py-[5px] px-4 border border-transparent rounded-lg text-slate-200 justify-center items-center bg-stone-800 hover:bg-stone-900"
                >
                  <AtSign className="h-4 w-4" />
                  <p className="text-slate-200 text-xs leading-loose font-semibold">
                    Feedback form
                  </p>
                </a>
                <ManagedHosting />
                <LogoutButton />
              </div> */}

              {/* Footer */}
              <div className="flex justify-center mt-2">
                <div className="flex space-x-4">
                  <a
                    href={paths.github()}
                    className="transition-all duration-300 p-2 rounded-full text-white bg-sidebar-button hover:opacity-80"
                  >
                    <GithubLogo weight="fill" className="h-5 w-5 " />
                  </a>
                  <a
                    href={paths.docs()}
                    className="transition-all duration-300 p-2 rounded-full text-white bg-sidebar-button hover:opacity-80"
                  >
                    <BookOpen weight="fill" className="h-5 w-5 " />
                  </a>
                  <a
                    href={paths.discord()}
                    className="transition-all duration-300 p-2 rounded-full text-white bg-sidebar-button hover:opacity-80"
                  >
                    <DiscordLogo
                      weight="fill"
                      className="h-5 w-5 stroke-slate-200 group-hover:stroke-slate-200"
                    />
                  </a>
                  <button className="transition-all duration-300 p-2 rounded-full text-white bg-sidebar-button hover:opacity-80">
                    <DotsThree className="h-5 w-5 group-hover:stroke-slate-200" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
    </>
  );
}

export function SidebarMobileHeader() {
  const { logo } = useLogo();
  const sidebarRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBgOverlay, setShowBgOverlay] = useState(false);
  const { showOverlay } = useSystemSettingsOverlay();
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();

  useEffect(() => {
    // Darkens the rest of the screen
    // when sidebar is open.
    function handleBg() {
      if (showSidebar) {
        setTimeout(() => {
          setShowBgOverlay(true);
        }, 300);
      } else {
        setShowBgOverlay(false);
      }
    }
    handleBg();
  }, [showSidebar]);

  return (
    <>
      <div className="flex justify-between relative top-0 left-0 w-full rounded-b-lg px-2 pb-4 bg-stone-800 text-slate-200">
        <button
          onClick={() => setShowSidebar(true)}
          className="rounded-md bg-stone-800 p-2 flex items-center justify-center hover:bg-stone-900 text-slate-200"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex shrink-0 w-fit items-center justify-start">
          <img
            src={logo}
            alt="Logo"
            className="rounded w-full max-h-[40px]"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
      <div
        style={{
          transform: showSidebar ? `translateX(0vw)` : `translateX(-100vw)`,
        }}
        className={`z-99 fixed top-0 left-0 transition-all duration-500 w-[100vw] h-[100vh]`}
      >
        <div
          className={`${
            showBgOverlay
              ? "transition-all opacity-1"
              : "transition-none opacity-0"
          }  duration-500 fixed top-0 left-0 bg-stone-800 bg-opacity-75 w-screen h-screen`}
          onClick={() => setShowSidebar(false)}
        />
        <div
          ref={sidebarRef}
          className="relative h-[100vh] fixed top-0 left-0  rounded-r-[26px] bg-stone-800 w-[80%] p-[18px] "
        >
          <SettingsOverlay />
          <div className="w-full h-full flex flex-col overflow-x-hidden items-between">
            {/* Header Information */}
            <div className="flex w-full items-center justify-between gap-x-4">
              <div className="flex shrink-1 w-fit items-center justify-start">
                <img
                  src={logo}
                  alt="Logo"
                  className="rounded w-full max-h-[40px]"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="flex gap-x-2 items-center text-slate-500 shink-0">
                <AdminHome />
                <SettingsButton onClick={showOverlay} />
              </div>
            </div>

            {/* Primary Body */}
            <div className="h-full flex flex-col w-full justify-between pt-4 overflow-y-hidden ">
              <div className="h-auto md:sidebar-items">
                <div
                  style={{ height: "calc(100vw - -3rem)" }}
                  className=" flex flex-col gap-y-4 pb-8 overflow-y-scroll no-scroll"
                >
                  <div className="flex gap-x-2 items-center justify-between">
                    <button
                      onClick={showNewWsModal}
                      className="flex flex-grow w-[75%] h-[36px] gap-x-2 py-[5px] px-4 border border-slate-400 rounded-lg text-slate-200 justify-start items-center hover:bg-stone-900"
                    >
                      <Plus className="h-4 w-4" />
                      <p className="text-slate-200 text-xs leading-loose font-semibold">
                        New workspace
                      </p>
                    </button>
                  </div>
                  <ActiveWorkspaces />
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-y-2">
                  <div className="w-full flex items-center justify-between">
                    <LLMStatus />
                    <IndexCount />
                  </div>
                  <a
                    href={paths.feedback()}
                    target="_blank"
                    className="flex flex-grow w-[100%] h-[36px] gap-x-2 py-[5px] px-4 border border-transparent rounded-lg text-slate-200 justify-center items-center bg-stone-800 hover:bg-stone-900"
                  >
                    <AtSign className="h-4 w-4" />
                    <p className="text-slate-200 text-xs leading-loose font-semibold">
                      Feedback form
                    </p>
                  </a>
                  <ManagedHosting />
                  <LogoutButton />
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between mt-2">
                  <div className="flex gap-x-1 items-center">
                    <a
                      href={paths.github()}
                      className="transition-all duration-300 p-2 rounded-full text-slate-400 bg-slate-800 hover:bg-slate-800 hover:text-slate-200"
                    >
                      <GithubLogo weight="fill" className="h-5 w-5 " />
                    </a>
                    <a
                      href={paths.docs()}
                      className="transition-all duration-300 p-2 rounded-full text-slate-400 bg-slate-800 hover:bg-slate-800 hover:text-slate-200"
                    >
                      <BookOpen weight="fill" className="h-4 w-4 " />
                    </a>
                    <a
                      href={paths.discord()}
                      className="transition-all duration-300 p-2 rounded-full bg-slate-800 hover:bg-slate-800 group"
                    >
                      <DiscordLogo
                        weight="fill"
                        className="h-4 w-4 stroke-slate-400 group-hover:stroke-slate-200"
                      />
                    </a>
                  </div>
                  <a
                    href={paths.mailToMintplex()}
                    className="transition-all duration-300 text-xs text-slate-600 hover:text-blue-400"
                  >
                    @MintplexLabs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      </div>
    </>
  );
}

function AdminHome() {
  const { user } = useUser();
  if (!user || user?.role !== "admin") return null;
  return (
    <a
      href={paths.admin.system()}
      className="transition-all duration-300 p-2 rounded-full text-slate-400 bg-stone-800 hover:bg-slate-800 hover:text-slate-200"
    >
      <Shield className="h-4 w-4" />
    </a>
  );
}

function LogoutButton() {
  if (!window.localStorage.getItem(AUTH_USER)) return null;
  const user = userFromStorage();
  if (!user.username) return null;

  return (
    <button
      onClick={() => {
        window.localStorage.removeItem(AUTH_USER);
        window.localStorage.removeItem(AUTH_TOKEN);
        window.location.replace(paths.home());
      }}
      className="flex flex-grow w-[100%] h-[36px] gap-x-2 py-[5px] px-4 border border-transparent rounded-lg text-slate-200 justify-center items-center bg-stone-800 hover:bg-stone-900"
    >
      <LogOut className="h-4 w-4" />
      <p className="text-slate-200 text-xs leading-loose font-semibold">
        Log out of {user.username}
      </p>
    </button>
  );
}

function SettingsButton({ onClick }) {
  const { user } = useUser();

  if (!!user && user?.role !== "admin") return null;
  return (
    <button
      onClick={onClick}
      className="transition-all duration-300 p-2 rounded-full text-white bg-sidebar-button hover:opacity-80"
    >
      <Wrench className="h-5 w-5 white-fill" />
    </button>
  );
}

function ManagedHosting() {
  if (window.location.origin.includes(".useanything.com")) return null;
  return (
    <a
      href={paths.hosting()}
      target="_blank"
      className="flex flex-grow w-[100%] h-[36px] gap-x-2 py-[5px] px-4 border border-transparent rounded-lg text-slate-200 justify-center items-center bg-stone-800 hover:bg-stone-900"
    >
      <Package className="h-4 w-4" />
      <p className="text-slate-200 text-xs leading-loose font-semibold">
        Managed cloud hosting
      </p>
    </a>
  );
}
