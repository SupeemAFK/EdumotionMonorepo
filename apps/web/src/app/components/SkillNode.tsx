"use client"

import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from "@xyflow/react";
import { motion } from "motion/react";
import { MdOutlineCheck } from "react-icons/md";
import { FaPersonRunning } from "react-icons/fa6";
import { ImNext2 } from "react-icons/im";
import { useWebcamStream } from '../hooks/useWebcamStream';
 
type SkillNodeData = {
  label: string;
  description: string;
  video: string;
  status: 'done' | 'current' | 'not-done';
};
export type SkillNodeType = Node<SkillNodeData>;

export default function SkillNode({ data }: NodeProps<SkillNodeType >) {
    const renderStatusBanner = () => {
        switch (data.status) {
        case "done":
            return (
            <div className="absolute top-0 w-full text-sm text-white text-center px-2 py-1 rounded-t-lg bg-gradient-to-r from-emerald-500 to-teal-500' shadow-md z-10">
                Done
            </div>
            );
        case "current":
            return (
            <div className="absolute top-0 w-full text-sm text-white text-center px-2 py-1 rounded-t-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500' shadow-lg z-10">
                Current
            </div>
            );
        default:
            return null;
        }
    };

    // Webcam streaming logic
    const showWebcam = data.status === 'current';
    const {
        videoRef,
        canvasRef,
        isStreaming,
        isConnected,
        error,
        startWebcam,
        connectWebSocket,
        startStreaming,
        stopStreaming,
    } = useWebcamStream({ autoStart: showWebcam });

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`
                min-w-56 max-w-64 relative group rounded-xl
                ${data.status === "current" ? 'p-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500' : data.status == "done" ? 'p-0.5 bg-gradient-to-r from-emerald-500 to-teal-500' : 'border-2 border-neutral-800'}
            `}
        >
            <div>
                {data.status == "done" ? (
                    <div className="text-white fixed top-[-10px] right-[-10px] z-50 p-[2px] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                        <div className="flex items-center justify-center w-8 h-8 bg-black rounded-full">
                            <MdOutlineCheck />
                        </div>
                    </div>
                ) : 
                data.status == "current" ? (
                    <div className="text-white fixed top-[-10px] right-[-10px] z-50 p-[2px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500">
                        <div className="flex items-center justify-center w-8 h-8 bg-black rounded-full">
                            <FaPersonRunning />
                        </div>
                    </div>
                ) : (
                    <div className="text-white fixed flex items-center justify-center top-[-10] right-[-10] w-8 h-8 bg-black border-2 border-neutral-800 rounded-[50%] z-50">
                        <ImNext2 />
                    </div>
                )}
            </div>
            {data.status === "current"&& (
                <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-lg blur-xs opacity-30 group-hover:opacity-50 transition duration-300"></div>
            )}
            <div className="relative bg-black text-white rounded-[10px] w-full h-full overflow-hidden">
                <div className="flex flex-col items-center leading-none">
                    {renderStatusBanner()}
                    <div className={`p-6 w-full text-center ${(data.status === "current" || data.status === "done") ? "mt-8" : ""}`}>
                        <h3 className="mt-2 font-semibold">{data.label}</h3>
                        <p className="text-[#b0b8c1] mt-2 text-sm">{data.description}</p>
                    </div>
                    {data.video && (
                        <div className="w-full">
                            <video
                                className="w-full bg-black"
                                src={data.video}
                                controls
                                poster="/window.svg"
                            />
                        </div>
                    )}
                    {/* Webcam preview and streaming controls if current */}
                    {showWebcam && (
                        <div className="w-full flex flex-col items-center mt-4">
                            <div className="relative bg-black rounded-xl overflow-hidden shadow-lg border border-white/10 w-full max-w-md">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-auto aspect-video rounded-xl"
                                />
                                {isStreaming && (
                                    <div className="absolute top-3 right-3 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 shadow animate-pulse">
                                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                        LIVE
                                    </div>
                                )}
                            </div>
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            {error && (
                                <div className="bg-red-900/80 border border-red-700 text-red-100 px-4 py-2 rounded-lg mt-2 text-xs">
                                    {error}
                                </div>
                            )}
                            <div className="px-2 flex items-center justify-around">
                                <button
                                    onClick={connectWebSocket}
                                    disabled={isConnected}
                                    className={`py-2 px-4 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                                        ${isConnected ? 'bg-green-600/80 text-white cursor-not-allowed opacity-80' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                >
                                    {isConnected ? 'Connected' : 'Connect'}
                                </button>
                                <button
                                    onClick={startStreaming}
                                      disabled={!isConnected || isStreaming}
                                    className={`py-2 px-4 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400
                                        ${!isConnected || isStreaming ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-70' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                >
                                    Start
                                </button>
                                <button
                                    onClick={stopStreaming}
                                    disabled={!isStreaming}
                                    className={`py-2 px-4 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400
                                        ${!isStreaming ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-70' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                >
                                    Stop
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
            <Handle type="target" position={Position.Top} className="!bg-gray-500" />
        </motion.div>
    );
}