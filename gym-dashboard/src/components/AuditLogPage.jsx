import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import {
  ScrollText,
  Trash2,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ACTION_CONFIG = {
  delete: { icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
  create: { icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50" },
  update: { icon: Pencil, color: "text-amber-600", bg: "bg-amber-50" },
};

const ENTITY_LABELS = {
  member: "Member",
  membership: "Membership",
  user: "Staff",
};

function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityFilter, setEntityFilter] = useState("all");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(entityFilter !== "all" && { entityType: entityFilter }),
      });
      const result = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, entityFilter]);

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const buildMessage = (log) => {
    const entityName = ENTITY_LABELS[log.entity_type] || log.entity_type;
    const actionVerb =
      log.action === "delete"
        ? "deleted"
        : log.action === "create"
          ? "created"
          : "updated";

    return (
      <>
        <span className="font-medium text-gray-900">{log.user_name}</span>{" "}
        {actionVerb} {entityName.toLowerCase()}{" "}
        <span className="font-medium text-gray-900">{log.entity_label}</span>
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Activity Log
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Track important changes across your gym.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "member", "membership", "user"].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setEntityFilter(filter);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              entityFilter === filter
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {filter === "all" ? "All Activity" : ENTITY_LABELS[filter]}
          </button>
        ))}
      </div>

      {/* Log List */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 bg-gray-100 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-64 bg-gray-100 rounded mb-1.5" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <ScrollText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              No activity yet
            </p>
            <p className="text-xs text-gray-400">
              Important changes will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => {
              const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.update;
              const ActionIcon = config.icon;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {getInitials(log.user_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {buildMessage(log)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(log.created_at)}
                    </p>
                  </div>
                  <div
                    className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0`}
                  >
                    <ActionIcon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && logs.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <span className="text-xs text-gray-400 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogPage;
