import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MoreHorizontal, Users, ShieldCheck, UserX, UserCheck, Crown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const roleColors: Record<string, string> = {
  admin: "border-primary/30 text-primary bg-primary/10",
  editor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  user: "border-muted-foreground/30 text-muted-foreground bg-muted/30",
};

export default function UsersManager() {
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const changeRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => { utils.users.list.invalidate(); toast.success("Role updated"); },
  });
  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: () => { utils.users.list.invalidate(); toast.success("User status updated"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage CMS users and their access roles</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <Users className="h-3.5 w-3.5" />
          <span>{users?.length ?? 0} total users</span>
        </div>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { role: "admin", label: "Admin", desc: "Full access to all CMS features" },
          { role: "editor", label: "Editor", desc: "Can manage content but not users" },
          { role: "user", label: "User", desc: "No CMS access" },
        ].map(({ role, label, desc }) => (
          <div key={role} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <Badge variant="outline" className={`text-xs ${roleColors[role]}`}>{label}</Badge>
            <span className="text-xs text-muted-foreground">{desc}</span>
          </div>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : users && users.length > 0 ? (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[1fr_100px_120px_100px_80px] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                <span>User</span>
                <span>Role</span>
                <span>Username</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              {users.map((u) => {
                const isCurrentUser = u.id === currentUser?.id;
                return (
                  <div key={u.id} className={`grid grid-cols-[1fr_100px_120px_100px_80px] gap-4 px-4 py-3 items-center hover:bg-muted/20 transition-colors ${!u.isActive ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8 border border-border shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {u.name?.charAt(0).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{u.name ?? "Unknown"}</p>
                          {isCurrentUser && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">You</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email ?? "—"}</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className={`text-xs capitalize ${roleColors[u.role] ?? ""}`}>
                        {u.role === "admin" && <Crown className="h-2.5 w-2.5 mr-1" />}
                        {u.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.username}</p>
                    <div>
                      <Badge variant="outline" className={u.isActive ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-end">
                      {!isCurrentUser ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            {u.role !== "admin" && (
                              <DropdownMenuItem onClick={() => changeRoleMutation.mutate({ id: u.id, role: "admin" })} className="cursor-pointer">
                                <Crown className="mr-2 h-4 w-4 text-primary" /> Make Admin
                              </DropdownMenuItem>
                            )}
                            {u.role !== "editor" && (
                              <DropdownMenuItem onClick={() => changeRoleMutation.mutate({ id: u.id, role: "editor" })} className="cursor-pointer">
                                <ShieldCheck className="mr-2 h-4 w-4 text-blue-400" /> Make Editor
                              </DropdownMenuItem>
                            )}
                            {u.role !== "user" && (
                              <DropdownMenuItem onClick={() => changeRoleMutation.mutate({ id: u.id, role: "user" })} className="cursor-pointer">
                                <Users className="mr-2 h-4 w-4" /> Remove CMS Access
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive })}
                              className={`cursor-pointer ${u.isActive ? "text-destructive focus:text-destructive" : "text-green-400 focus:text-green-400"}`}
                            >
                              {u.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                              {u.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="h-8 w-8" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
