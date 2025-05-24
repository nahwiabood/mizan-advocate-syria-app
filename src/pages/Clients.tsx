import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Edit, ChevronDown, ChevronRight, User, FileText, Calendar as CalendarIcon, Users } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseStage, Session } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // Dialog states
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editingStage, setEditingStage] = useState<CaseStage | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  // Form states
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [caseForm, setCaseForm] = useState({
    opponent: '',
    subject: ''
  });

  const [stageForm, setStageForm] = useState({
    courtName: '',
    caseNumber: '',
    notes: ''
  });

  const [sessionForm, setSessionForm] = useState({
    firstSessionDate: undefined as Date | undefined,
    postponementReason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setStages(dataStore.getStages());
    setSessions(dataStore.getSessions());
  };

  const toggleClient = (clientId: string) => {
    // Close all other clients first
    setExpandedClients(new Set([clientId]));
    setExpandedCases(new Set());
    setExpandedStages(new Set());
  };

  const toggleCase = (caseId: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseId)) {
      newExpanded.delete(caseId);
    } else {
      newExpanded.add(caseId);
    }
    setExpandedCases(newExpanded);
    setExpandedStages(new Set());
  };

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  // CRUD operations
  const handleAddClient = () => {
    if (!clientForm.name) return;

    dataStore.addClient({
      name: clientForm.name,
      email: clientForm.email,
      phone: clientForm.phone,
      address: clientForm.address,
      notes: clientForm.notes
    });

    resetClientForm();
    setIsClientDialogOpen(false);
    loadData();
  };

  const handleEditClient = () => {
    if (!editingClient || !clientForm.name) return;

    dataStore.updateClient(editingClient.id, {
      name: clientForm.name,
      email: clientForm.email,
      phone: clientForm.phone,
      address: clientForm.address,
      notes: clientForm.notes
    });

    resetClientForm();
    setIsClientDialogOpen(false);
    setEditingClient(null);
    loadData();
  };

  const handleAddCase = () => {
    if (!caseForm.opponent || !caseForm.subject || !selectedClientId) return;

    dataStore.addCase({
      clientId: selectedClientId,
      opponent: caseForm.opponent,
      subject: caseForm.subject,
      status: 'active'
    });

    resetCaseForm();
    setIsCaseDialogOpen(false);
    loadData();
  };

  const handleEditCase = () => {
    if (!editingCase || !caseForm.opponent || !caseForm.subject) return;

    dataStore.updateCase(editingCase.id, {
      opponent: caseForm.opponent,
      subject: caseForm.subject
    });

    resetCaseForm();
    setIsCaseDialogOpen(false);
    setEditingCase(null);
    loadData();
  };

  const handleAddStage = () => {
    if (!stageForm.courtName || !stageForm.caseNumber || !selectedCaseId) return;

    dataStore.addStage({
      caseId: selectedCaseId,
      courtName: stageForm.courtName,
      caseNumber: stageForm.caseNumber,
      stageName: `${stageForm.courtName} - ${stageForm.caseNumber}`,
      notes: stageForm.notes,
      firstSessionDate: null
    });

    resetStageForm();
    setIsStageDialogOpen(false);
    loadData();
  };

  const handleEditStage = () => {
    if (!editingStage || !stageForm.courtName || !stageForm.caseNumber) return;

    dataStore.updateStage(editingStage.id, {
      courtName: stageForm.courtName,
      caseNumber: stageForm.caseNumber,
      stageName: `${stageForm.courtName} - ${stageForm.caseNumber}`,
      notes: stageForm.notes
    });

    resetStageForm();
    setIsStageDialogOpen(false);
    setEditingStage(null);
    loadData();
  };

  const handleAddSession = () => {
    if (!sessionForm.firstSessionDate || !selectedStageId) return;

    const stage = stages.find(s => s.id === selectedStageId);
    if (!stage) return;

    const case_ = cases.find(c => c.id === stage.caseId);
    if (!case_) return;

    const client = clients.find(c => c.id === case_.clientId);
    if (!client) return;

    dataStore.addSession({
      stageId: selectedStageId,
      courtName: stage.courtName,
      caseNumber: stage.caseNumber,
      sessionDate: sessionForm.firstSessionDate,
      clientName: client.name,
      opponent: case_.opponent,
      postponementReason: sessionForm.postponementReason,
      isTransferred: false
    });

    // Update stage with first session date
    dataStore.updateStage(selectedStageId, {
      firstSessionDate: sessionForm.firstSessionDate
    });

    resetSessionForm();
    setIsSessionDialogOpen(false);
    loadData();
  };

  // Reset form functions
  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  const resetCaseForm = () => {
    setCaseForm({
      opponent: '',
      subject: ''
    });
  };

  const resetStageForm = () => {
    setStageForm({
      courtName: '',
      caseNumber: '',
      notes: ''
    });
  };

  const resetSessionForm = () => {
    setSessionForm({
      firstSessionDate: undefined,
      postponementReason: ''
    });
  };

  // Open dialog functions
  const openAddClientDialog = () => {
    resetClientForm();
    setEditingClient(null);
    setIsClientDialogOpen(true);
  };

  const openEditClientDialog = (client: Client) => {
    setClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setEditingClient(client);
    setIsClientDialogOpen(true);
  };

  const openAddCaseDialog = (clientId: string) => {
    resetCaseForm();
    setSelectedClientId(clientId);
    setEditingCase(null);
    setIsCaseDialogOpen(true);
  };

  const openEditCaseDialog = (case_: Case) => {
    setCaseForm({
      opponent: case_.opponent,
      subject: case_.subject
    });
    setEditingCase(case_);
    setIsCaseDialogOpen(true);
  };

  const openAddStageDialog = (caseId: string) => {
    resetStageForm();
    setSelectedCaseId(caseId);
    setEditingStage(null);
    setIsStageDialogOpen(true);
  };

  const openEditStageDialog = (stage: CaseStage) => {
    setStageForm({
      courtName: stage.courtName,
      caseNumber: stage.caseNumber,
      notes: stage.notes || ''
    });
    setEditingStage(stage);
    setIsStageDialogOpen(true);
  };

  const openAddSessionDialog = (stageId: string) => {
    resetSessionForm();
    setSelectedStageId(stageId);
    setIsSessionDialogOpen(true);
  };

  const getClientCases = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getCaseStages = (caseId: string) => {
    return stages.filter(stage => stage.caseId === caseId);
  };

  const getStageSessions = (stageId: string) => {
    return sessions.filter(session => session.stageId === stageId);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6" dir="ltr">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-left flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clients Management
              </CardTitle>
              <Button onClick={openAddClientDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="border rounded-lg">
                  <Collapsible 
                    open={expandedClients.has(client.id)} 
                    onOpenChange={() => toggleClient(client.id)}
                  >
                    <CollapsibleTrigger className="w-full p-4 text-left hover:bg-muted transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedClients.has(client.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <User className="h-4 w-4" />
                          <div>
                            <span className="font-medium">{client.name}</span>
                            {(client.phone || client.email) && (
                              <div className="text-sm text-muted-foreground">
                                {client.phone && <span>{client.phone}</span>}
                                {client.phone && client.email && <span> • </span>}
                                {client.email && <span>{client.email}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditClientDialog(client);
                            }}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddCaseDialog(client.id);
                            }}
                            className="gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Add Case
                          </Button>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="ml-6 space-y-3">
                        {getClientCases(client.id).map((case_) => (
                          <div key={case_.id} className="border rounded-md">
                            <Collapsible
                              open={expandedCases.has(case_.id)}
                              onOpenChange={() => toggleCase(case_.id)}
                            >
                              <CollapsibleTrigger className="w-full p-3 text-left hover:bg-muted transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {expandedCases.has(case_.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                    <FileText className="h-4 w-4" />
                                    <div>
                                      <span className="font-medium">{case_.subject}</span>
                                      <div className="text-sm text-muted-foreground">
                                        vs. {case_.opponent}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditCaseDialog(case_);
                                      }}
                                      className="gap-1"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAddStageDialog(case_.id);
                                      }}
                                      className="gap-1"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add Stage
                                    </Button>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent className="px-3 pb-3">
                                <div className="ml-6 space-y-3">
                                  {getCaseStages(case_.id).map((stage) => (
                                    <div key={stage.id} className="border rounded-md">
                                      <Collapsible
                                        open={expandedStages.has(stage.id)}
                                        onOpenChange={() => toggleStage(stage.id)}
                                      >
                                        <CollapsibleTrigger className="w-full p-3 text-left hover:bg-muted transition-colors">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              {expandedStages.has(stage.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4" />
                                              )}
                                              <CalendarIcon className="h-4 w-4" />
                                              <div>
                                                <span className="font-medium">{stage.courtName}</span>
                                                <div className="text-sm text-muted-foreground">
                                                  Case No: {stage.caseNumber}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openEditStageDialog(stage);
                                                }}
                                                className="gap-1"
                                              >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openAddSessionDialog(stage.id);
                                                }}
                                                className="gap-1"
                                              >
                                                <Plus className="h-4 w-4" />
                                                Add Session
                                              </Button>
                                            </div>
                                          </div>
                                        </CollapsibleTrigger>
                                        
                                        <CollapsibleContent className="px-3 pb-3">
                                          <div className="ml-6">
                                            {getStageSessions(stage.id).length > 0 ? (
                                              <Table>
                                                <TableHeader>
                                                  <TableRow>
                                                    <TableHead>Session Date</TableHead>
                                                    <TableHead>Next Session</TableHead>
                                                    <TableHead>Postponement Reason</TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  {getStageSessions(stage.id).map((session) => (
                                                    <TableRow key={session.id}>
                                                      <TableCell>
                                                        {formatSyrianDate(session.sessionDate)}
                                                      </TableCell>
                                                      <TableCell>
                                                        {session.nextSessionDate ? formatSyrianDate(session.nextSessionDate) : '-'}
                                                      </TableCell>
                                                      <TableCell>
                                                        {session.postponementReason || '-'}
                                                      </TableCell>
                                                    </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                            ) : (
                                              <div className="text-center py-4 text-muted-foreground">
                                                No sessions yet
                                              </div>
                                            )}
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Dialog */}
        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Name</Label>
                <Input
                  id="clientName"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Client name"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Address</Label>
                <Input
                  id="clientAddress"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  placeholder="Address"
                />
              </div>
              <div>
                <Label htmlFor="clientNotes">Notes</Label>
                <Textarea
                  id="clientNotes"
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <Button 
                onClick={editingClient ? handleEditClient : handleAddClient} 
                className="w-full"
              >
                {editingClient ? 'Update Client' : 'Add Client'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Case Dialog */}
        <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCase ? 'Edit Case' : 'Add New Case'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="caseOpponent">Opponent</Label>
                <Input
                  id="caseOpponent"
                  value={caseForm.opponent}
                  onChange={(e) => setCaseForm({ ...caseForm, opponent: e.target.value })}
                  placeholder="Opponent name"
                />
              </div>
              <div>
                <Label htmlFor="caseSubject">Case Subject</Label>
                <Input
                  id="caseSubject"
                  value={caseForm.subject}
                  onChange={(e) => setCaseForm({ ...caseForm, subject: e.target.value })}
                  placeholder="Case subject"
                />
              </div>
              <Button 
                onClick={editingCase ? handleEditCase : handleAddCase} 
                className="w-full"
              >
                {editingCase ? 'Update Case' : 'Add Case'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stage Dialog */}
        <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStage ? 'Edit Stage' : 'Add New Stage'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stageCourt">Court</Label>
                <Input
                  id="stageCourt"
                  value={stageForm.courtName}
                  onChange={(e) => setStageForm({ ...stageForm, courtName: e.target.value })}
                  placeholder="Court name"
                />
              </div>
              <div>
                <Label htmlFor="stageCaseNumber">Case Number</Label>
                <Input
                  id="stageCaseNumber"
                  value={stageForm.caseNumber}
                  onChange={(e) => setStageForm({ ...stageForm, caseNumber: e.target.value })}
                  placeholder="Case number"
                />
              </div>
              <div>
                <Label htmlFor="stageNotes">Notes (Optional)</Label>
                <Textarea
                  id="stageNotes"
                  value={stageForm.notes}
                  onChange={(e) => setStageForm({ ...stageForm, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <Button 
                onClick={editingStage ? handleEditStage : handleAddStage} 
                className="w-full"
              >
                {editingStage ? 'Update Stage' : 'Add Stage'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Session Dialog */}
        <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>First Session Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !sessionForm.firstSessionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {sessionForm.firstSessionDate ? (
                        format(sessionForm.firstSessionDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={sessionForm.firstSessionDate}
                      onSelect={(date) => setSessionForm({ ...sessionForm, firstSessionDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="sessionReason">Postponement Reason</Label>
                <Textarea
                  id="sessionReason"
                  value={sessionForm.postponementReason}
                  onChange={(e) => setSessionForm({ ...sessionForm, postponementReason: e.target.value })}
                  placeholder="Postponement reason"
                />
              </div>
              <Button onClick={handleAddSession} className="w-full">
                Add Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Clients;
