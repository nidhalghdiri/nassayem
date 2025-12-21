"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building,
  Clock,
} from "lucide-react";
import LayoutAdmin from "@/components/layout/LayoutAdmin";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    housekeeping: 0,
    receptionist: 0,
    supervisor: 0,
    director: 0,
    admin: 0,
  });
  const itemsPerPage = 10;

  return (
    <LayoutAdmin>
      <div className="container-fluid">Hello</div>
    </LayoutAdmin>
  );
}
