import { useState, useEffect } from 'react';
import { X, CheckCircle, Circle, Save, Trash2 } from 'lucide-react';
import { Project, ProjectMilestone, PROJECT_STAGES, ProjectStage } from '../types/project';
import { supabase } from '../lib/supabase';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProjectModal({ project, onClose, onUpdate }: ProjectModalProps) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [notes, setNotes] = useState(project.notes);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, [project.id]);

  async function loadMilestones() {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        await createInitialMilestones();
      } else {
        setMilestones(data);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  }

  async function createInitialMilestones() {
    try {
      const initialMilestones = PROJECT_STAGES.map((stage, index) => ({
        project_id: project.id,
        stage: stage.value,
        completed: index === 0,
        completed_at: index === 0 ? new Date().toISOString() : null
      }));

      const { data, error } = await supabase
        .from('project_milestones')
        .insert(initialMilestones)
        .select();

      if (error) throw error;
      if (data) setMilestones(data);
    } catch (error) {
      console.error('Error creating milestones:', error);
    }
  }

  async function toggleMilestone(milestone: ProjectMilestone) {
    try {
      const newCompleted = !milestone.completed;
      const { error } = await supabase
        .from('project_milestones')
        .update({
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('id', milestone.id);

      if (error) throw error;

      const stageIndex = PROJECT_STAGES.findIndex(s => s.value === milestone.stage);
      if (newCompleted && stageIndex >= 0) {
        await supabase
          .from('projects')
          .update({
            current_stage: milestone.stage,
            updated_at: new Date().toISOString()
          })
          .eq('id', project.id);
      }

      await loadMilestones();
      onUpdate();
    } catch (error) {
      console.error('Error toggling milestone:', error);
    }
  }

  async function saveNotes() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject() {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {project.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Project Milestones
            </h3>
            <div className="space-y-3">
              {milestones.map((milestone, index) => {
                const stageInfo = PROJECT_STAGES.find(s => s.value === milestone.stage);
                return (
                  <div
                    key={milestone.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      milestone.completed
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => toggleMilestone(milestone)}
                  >
                    {milestone.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Stage {index + 1}
                        </span>
                        {milestone.completed && milestone.completed_at && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Completed {new Date(milestone.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {stageInfo?.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stageInfo?.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Project Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your progress, challenges, learnings..."
              className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={deleteProject}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Deleting...' : 'Delete Project'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
