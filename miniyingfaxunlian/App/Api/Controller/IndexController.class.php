<?php
namespace Api\Controller;
use Think\Controller;
class IndexController extends PublicController {
    //***************************
    //  首页数据接口
    //***************************
    public function index(){

        //======================
        //首页推荐分类6个
        //======================
        $cat = M('pro_cat')->where('del=0 AND type=1')->order('id asc')->field('id,name')->limit(4)->select();
        foreach ($cat as $k => $v) {
            $list = M('product')->where('del=0 AND cid='.intval($v['id']))->field('id,name,intro,photo_x,addtime')->order('sort asc')->limit(12)->select();
            foreach ($list as $key => $val) {
                $timenum = intval(time()-$val['addtime']);
                $tian = ceil($timenum/86400);
                $xiaoshi = ceil($timenum/3600);
                $fenzhong = ceil($timenum/60);
                if (intval($tian)>1) {
                    if (intval($tian)>3) {
                        $list[$key]['desc'] = date("m-d",$val['addtime']);
                    }else{
                        $list[$key]['desc'] = intval($tian).'天前';
                    }
                }elseif (intval($xiaoshi)>0) {
                    $list[$key]['desc'] = intval($xiaoshi).'小时前';
                }elseif (intval($fenzhong)>0) {
                    $list[$key]['desc'] = intval($fenzhong).'分钟前';
                }else{
                    $list[$key]['desc'] = intval($timenum).'秒前';
                }
                //图片
                $list[$key]['photo_x'] = __DATAURL__.$val['photo_x'];
            }
            $cat[$k]['list'] = $list;
        }

        $qtype = 1;
        if (intval($_REQUEST['qtype'])) {
           $qtype = intval($_REQUEST['qtype']); 
        }

        //获取问题列表
        $qlist = M('question')->where('1=1 AND qtype='.$qtype)->order('is_top desc,addtime desc')->limit(10)->select();
        foreach ($qlist as $k => $v) {
            $user = M('user')->where('id='.intval($v['uid']))->find();
            $qlist[$k]['avatar'] = $user['photo'];
            $qlist[$k]['name'] = $user['name'];
            $qlist[$k]['utype'] = intval($user['type']);
            $qlist[$k]['addtime'] = date("Y-m-d",$v['addtime']);
            $qlist[$k]['nums'] = intval(M('answer')->where('reply_id='.intval($v['id']))->getField('COUNT(id)'));
        }

        //获取上次阅读记录
        $info = M('listen_log')->where('uid='.intval($_REQUEST['uid']))->order('id desc')->limit(1)->find();

        //获取提问区标题
        $twqtitle = M('program')->where('id=1')->getField('twqtitle');
        if (!$twqtitle) {
            $twqtitle = '提问区';
        }

        //获取公告
        $notice = M('web')->where('id=1')->find();
        $content = str_replace('/miniread/Data/', __DATAURL__, $notice['concent']);
        $notice['concent']=html_entity_decode($content, ENT_QUOTES , 'utf-8');

        echo json_encode(array('catlist'=>$cat,'info'=>$info,'qlist'=>$qlist,'twqtitle'=>$twqtitle,'notice'=>$notice,'img'=>$arr));
        exit();
    }

    //***************************
    //  首页数据接口
    //***************************
    public function index_api() {
        $list = M('pro_cat')->where('del=0 AND tid=0 AND id!=10')->order('sort asc,addtime desc')->select();
        foreach ($list as $k => $v) {
            $list[$k]['img'] = __DATAURL__.$v['img'];
            $list[$k]['backimg'] = __DATAURL__.$v['backimg'];
            $list[$k]['tcat'] = intval(M('pro_cat')->where('del=0 AND tid='.intval($v['id']))->getField('COUNT(id)'));
        }

        //获取上次阅读记录
        $info = M('listen_log')->where('uid='.intval($_REQUEST['uid']))->order('id desc')->limit(1)->find();

        echo json_encode(array('list'=>$list,'info'=>$info));
        exit();
    }

    //***************************
    //  首页问题 列表
    //***************************
    public function getquestion () {
        //获取公告
        $notice = M('web')->where('id=1')->find();
        $content = str_replace('/miniread/Data/', __DATAURL__, $notice['concent']);
        $notice['concent']=html_entity_decode($content, ENT_QUOTES , 'utf-8');

        //获取问题列表
        $qlist = M('question')->where('1=1 AND qtype='.intval($_REQUEST['qtype']))->order('is_top desc,addtime desc')->limit(10)->select();
        foreach ($qlist as $k => $v) {
            $user = M('user')->where('id='.intval($v['uid']))->find();
            $qlist[$k]['avatar'] = $user['photo'];
            $qlist[$k]['name'] = $user['name'];
            $qlist[$k]['utype'] = intval($user['type']);
            $qlist[$k]['addtime'] = date("Y-m-d",$v['addtime']);
            $qlist[$k]['pro_name'] = M('product')->where('id='.intval($v['pro_id']))->getField('name');
            $qlist[$k]['nums'] = intval(M('answer')->where('reply_id='.intval($v['id']))->getField('COUNT(id)'));
        }

        //获取会员发布问题的总数
        $nums = intval(M('question')->where('uid='.intval($_REQUEST['uid']))->getField('COUNT(id)'));

        echo json_encode(array('list'=>$qlist,'notice'=>$notice,'nums'=>$nums));
        exit();
    }

    //***************************
    //  首页问题 分页
    //***************************
    public function getlist(){
        $page = intval($_REQUEST['page']);
        if (!$page) {
           $page=2;
        }
        $limit = intval($page*10)-10;

        //获取问题列表
        $qlist = M('question')->where('1=1 AND qtype='.intval($_REQUEST['qtype']))->order('is_top desc,addtime desc')->limit($limit.',10')->select();
        foreach ($qlist as $k => $v) {
            $user = M('user')->where('id='.intval($v['uid']))->find();
            $qlist[$k]['avatar'] = $user['photo'];
            $qlist[$k]['name'] = $user['name'];
            $qlist[$k]['utype'] = intval($user['type']);
            $qlist[$k]['addtime'] = date("Y-m-d",$v['addtime']);
            $qlist[$k]['pro_name'] = M('product')->where('id='.intval($v['pro_id']))->getField('name');
            $qlist[$k]['nums'] = intval(M('answer')->where('reply_id='.intval($v['id']))->getField('COUNT(id)'));
        }

        echo json_encode(array('list'=>$qlist));
        exit();
    }

    //***************************
    //  获取单个分类 更多
    //***************************
    public function getcatmore(){
        $cat_id= intval($_REQUEST['cat_id']);
        if (!$cat_id) {
            echo json_encode(array('status'=>0,'err'=>'没有找到更多数据.'));
            exit();
        }

        $page = intval($_REQUEST['page']);
        if (!$page) {
           $page=1;
        }
        $limit = intval($page*10)-10;

        $list = M('product')->where('del=0 AND cid='.intval($cat_id))->field('id,name,intro,photo_x,addtime,is_free')->order('sort asc')->select();
        foreach ($list as $key => $val) {
            $timenum = intval(time()-$val['addtime']);
            $tian = ceil($timenum/86400);
            $xiaoshi = ceil($timenum/3600);
            $fenzhong = ceil($timenum/60);
            if (intval($tian)>1) {
                if (intval($tian)>3) {
                    $list[$key]['desc'] = date("m-d",intval($val['addtime']));
                }else{
                    $list[$key]['desc'] = intval($tian).'天前';
                }
            }elseif (intval($xiaoshi)>0) {
                $list[$key]['desc'] = intval($xiaoshi).'小时前';
            }elseif (intval($fenzhong)>0) {
                $list[$key]['desc'] = intval($fenzhong).'分钟前';
            }else{
                $list[$key]['desc'] = intval($timenum).'秒前';
            }

            //图片
            $list[$key]['photo_x'] = __DATAURL__.$val['photo_x'];
            $list[$key]['ctype'] = M('pro_cat')->where('id='.intval($cat_id))->getField('cattype');
        }

        $catname = M('pro_cat')->where('id='.intval($cat_id))->getField('name');

        echo json_encode(array('status'=>1,'list'=>$list,'catname'=>$catname));
        exit();
    }

    //***************************
    //  获取活动公告内容
    //***************************
    public function getnotice() {
        $info = M('web')->where('id='.intval($_REQUEST['id']))->find();
        $info['addtime'] = date("Y-m-d",$info['addtime']);
        echo json_encode(array('info'=>$info));
        exit();
    }

    //***************************
    //  获取视频列表 接口
    //***************************
    public function getvideo() {
        $info = M('pro_cat')->where('del=0 AND id='.intval($_REQUEST['cid']))->field('id,name,backimg,desc')->find();
        $info['backimg'] = __DATAURL__.$info['backimg'];

        $list = M('product')->where('del=0 AND cid='.intval($_REQUEST['cid']))->field('id,name,intro,photo_x,is_free')->order('sort asc')->select();
        foreach ($list as $k => $v) {
            $list[$k]['photo_x'] = __DATAURL__.$v['photo_x'];
        }

        echo json_encode(array('list'=>$list,'info'=>$info));
        exit();
    }

    //***************************
    //  获取视频详情 接口
    //***************************
    public function getvideoxq() {
        $id = intval($_REQUEST['id']);
        $info = M('product')->where('del=0 AND id='.intval($id))->field('id,name,papers,content,renqi')->find();
        if (!$info) {
            echo json_encode(array('status'=>0,'err'=>'数据信息异常.'));
            exit();
        }
        $info['papers'] = __DATAURL__.$info['papers'];

        //处理详情信息
        $content = str_replace('/miniread/Data/', __DATAURL__, $info['content']);
        $info['content'] = html_entity_decode($content, ENT_QUOTES , 'utf-8');

        //增加人气
        M('product')->where('id='.intval($id))->save(array('renqi'=>intval($info['renqi'])+1));

        echo json_encode(array('status'=>1,'info'=>$info));
        exit();
    }

}